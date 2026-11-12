// Records a project card's looping clip from a scene drawn with code: a loose
// HTML file in this folder, scripts/loops/<id>.html, that exposes
//
//   window.LOOP               { width, height, seconds, fps }
//   window.renderLoop(phase)  draws the frame at `phase` (0 to 1; 1 is 0 again)
//
// One clip per theme, as .mp4 (H.264) and .webm (VP9) plus a poster (the first
// frame), into public/media/projects/<id>/ as loop-light.* and loop-dark.*
// (lib/media.ts, projectLoop). The scene gets the site's own colours: this
// script reads each theme's tokens and the card's tint (.frag-stage) from
// app/globals.css and hands them to the page, so a clip's background is the
// card's.
//
//   node scripts/loops/record.mjs cooling-agent
//   node scripts/loops/record.mjs cooling-agent --stills /tmp/frames   (6 frames per theme, and the last one, as PNG: to look before recording)
//
// Needs Playwright (with its Chromium) and ffmpeg on the machine; neither is a
// dependency of the site. Frame by frame, not in real time: the clip is sharp
// and loops without a seam whatever the machine's speed. Same encoding as
// scripts/record-project-loops.mjs.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const { chromium } = createRequire(import.meta.url)("playwright");
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const [id, ...rest] = process.argv.slice(2);
const scene = join(HERE, `${id}.html`);
if (!id || !existsSync(scene)) {
  console.error("usage: node scripts/loops/record.mjs <project id> [--stills <folder>]   (the scene is scripts/loops/<project id>.html)");
  process.exit(1);
}
const stills = rest[0] === "--stills" ? rest[1] : null;
const THEMES = ["light", "dark"];
// BT.709, limited range, and tagged as such: the clip's flat background has to match the card's own colour
const VIDEO = ["-vf", "scale=iw:ih:out_color_matrix=bt709:out_range=tv,format=yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv", "-an"];
const ffmpeg = (...args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });

// The site's tokens, per theme, and the tint at the top of a card's illustration.
const css = readFileSync(join(ROOT, "app", "globals.css"), "utf8");
const need = (match, what) => {
  if (!match) throw new Error(`app/globals.css: ${what} not found`);
  return match[1].trim();
};
const TOKENS = {
  light: need(css.match(/^:root,\s*\[data-theme="light"\]\s*\{([^}]*)\}/m), "the light theme's tokens"),
  dark: need(css.match(/^\[data-theme="dark"\]\s*\{([^}]*)\}/m), "the dark theme's tokens"),
};
const STAGE = {
  light: need(css.match(/^\.frag-stage\s*\{[^}]*?background:\s*([^;]+);/m), ".frag-stage's background"),
  dark: need(css.match(/^\[data-theme="dark"\] \.frag-stage\s*\{[^}]*?background:\s*([^;]+);/m), "the dark .frag-stage's background"),
};

const browser = await chromium.launch();
for (const theme of THEMES) {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  page.on("pageerror", (e) => {
    console.error(`${id}.html: ${e.message}`);
    process.exit(1);
  });
  await page.goto(`${pathToFileURL(scene).href}?theme=${theme}&phase=0`);
  await page.waitForFunction(() => typeof window.renderLoop === "function");
  // (html[data-theme]: above the scene's own fallbacks)
  await page.addStyleTag({ content: `html:root { ${TOKENS[theme]} --stage: ${STAGE[theme]}; }` });
  const { width, height, seconds, fps } = await page.evaluate(() => window.LOOP);
  await page.setViewportSize({ width, height });
  const total = seconds * fps;
  const shot = async (i, path) => {
    await page.evaluate((phase) => window.renderLoop(phase), i / total);
    await page.screenshot({ path, clip: { x: 0, y: 0, width, height } });
  };

  if (stills) {
    mkdirSync(stills, { recursive: true });
    const picks = [...Array.from({ length: 6 }, (_, k) => Math.round((k * total) / 6)), total - 1];
    for (const i of picks) await shot(i, join(stills, `${id}-${theme}-${String(i).padStart(4, "0")}.png`));
    console.log(`${id}  ${theme}  frames ${picks.join(", ")} of ${total} → ${stills}`);
  } else {
    const frames = mkdtempSync(join(tmpdir(), "loop-"));
    for (let i = 0; i < total; i++) await shot(i, join(frames, `f_${String(i).padStart(4, "0")}.png`));
    const dir = join(ROOT, "public", "media", "projects", id);
    mkdirSync(dir, { recursive: true });
    const base = join(dir, `loop-${theme}`);
    const input = ["-framerate", String(fps), "-i", join(frames, "f_%04d.png")];
    ffmpeg(...input, ...VIDEO, "-c:v", "libx264", "-preset", "veryslow", "-crf", "27", "-movflags", "+faststart", `${base}.mp4`);
    ffmpeg(...input, ...VIDEO, "-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0", "-deadline", "good", "-cpu-used", "1", "-row-mt", "1", `${base}.webm`);
    ffmpeg("-i", join(frames, "f_0000.png"), "-frames:v", "1", "-q:v", "4", `${base}.poster.jpg`);
    rmSync(frames, { recursive: true, force: true });
    console.log(`${id}  ${theme}  ${total} frames → ${base}.(mp4|webm|poster.jpg)`);
  }
  await page.close();
}
await browser.close();
