// Records a project card's looping clip from a scene drawn in code: an HTML file in
// this folder that draws one frame for a phase from 0 to 1 (window.loop = { width,
// height, seconds, fps, draw(phase) }) and takes its theme from ?theme=light|dark.
// One clip per theme, as .mp4 (H.264) and .webm (VP9), plus a poster (the first
// frame), into public/media/projects/<id>/ as loop-light.* and loop-dark.*, which is
// where the site looks for them (lib/media.ts, projectLoop).
//
//   node scripts/loops/record.mjs <scene> <project id>
//   node scripts/loops/record.mjs shortlist job-hunt-copilot
//
// Needs Playwright (with its Chromium) and ffmpeg on the machine; neither is a
// dependency of the site. Frame by frame, not in real time: the clip is sharp and
// its last frame runs into its first whatever the machine's speed. Same encoding
// as the clips recorded from the cards (scripts/record-project-loops.mjs).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const { chromium } = createRequire(import.meta.url)("playwright");
const HERE = dirname(fileURLToPath(import.meta.url));
const [scene, id] = process.argv.slice(2);
const file = join(HERE, `${scene}.html`);
if (!scene || !id || !existsSync(file)) {
  console.error("usage: node scripts/loops/record.mjs <scene> <project id>   (scene: an .html in scripts/loops/, without the extension)");
  process.exit(1);
}
const OUT = join(HERE, "..", "..", "public", "media", "projects", id);
const THEMES = ["light", "dark"];
/** The heaviest an .mp4 may be: it plays at the top of a card, and loads as the card nears the screen. */
const MAX_MP4 = 400_000;
// BT.709, limited range, and tagged as such: the clip's flat background has to match the card's own colour
const VIDEO = ["-vf", "scale=iw:ih:out_color_matrix=bt709:out_range=tv,format=yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv", "-an"];
const ffmpeg = (...args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
let heavy = false;
for (const theme of THEMES) {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  page.on("pageerror", (error) => {
    console.error(`${scene}.html: ${error.message}`);
    process.exit(1);
  });
  await page.goto(`${pathToFileURL(file)}?theme=${theme}`, { waitUntil: "load" });
  await page.waitForFunction(() => typeof window.loop?.draw === "function");
  const { width, height, seconds, fps } = await page.evaluate(() => ({ width: window.loop.width, height: window.loop.height, seconds: window.loop.seconds, fps: window.loop.fps }));
  await page.setViewportSize({ width, height });
  const count = Math.round(seconds * fps);
  const frames = mkdtempSync(join(tmpdir(), "loop-"));
  for (let i = 0; i < count; i++) {
    await page.evaluate((phase) => window.loop.draw(phase), i / count);
    await page.screenshot({ path: join(frames, `f_${String(i).padStart(4, "0")}.png`), clip: { x: 0, y: 0, width, height } });
  }
  await page.close();

  const base = join(OUT, `loop-${theme}`);
  const input = ["-framerate", String(fps), "-i", join(frames, "f_%04d.png")];
  ffmpeg(...input, ...VIDEO, "-c:v", "libx264", "-preset", "veryslow", "-crf", "27", "-movflags", "+faststart", `${base}.mp4`);
  ffmpeg(...input, ...VIDEO, "-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0", "-deadline", "good", "-cpu-used", "1", "-row-mt", "1", `${base}.webm`);
  ffmpeg("-i", join(frames, "f_0000.png"), "-frames:v", "1", "-q:v", "4", `${base}.poster.jpg`);
  rmSync(frames, { recursive: true, force: true });

  const kB = (ext) => Math.round(statSync(`${base}.${ext}`).size / 1000);
  heavy ||= statSync(`${base}.mp4`).size > MAX_MP4;
  console.log(`${id}  ${theme}  ${width} × ${height}, ${count} frames  mp4 ${kB("mp4")} kB  webm ${kB("webm")} kB  poster ${kB("poster.jpg")} kB`);
}
await browser.close();

// a clip per language (loop-es-dark…) comes before these on the site
const older = readdirSync(OUT).filter((f) => /^loop-(en|es)([-.]|$)/i.test(f));
if (older.length) console.warn(`\n${id}: the site still prefers ${older.join(", ")}. Delete them to show the new clips.`);
if (heavy) {
  console.error(`\nAn .mp4 is over ${MAX_MP4 / 1000} kB: make the scene simpler (fewer points, slower) and record it again.`);
  process.exit(1);
}
