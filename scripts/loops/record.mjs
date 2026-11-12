// Records the looping clip at the top of a project card from a canvas scene in
// this folder: scripts/loops/<project id>.html → loop-light.* and loop-dark.*
// (.mp4, .webm and .poster.jpg) in public/media/projects/<project id>/. The
// site then shows that clip on the card, in both languages (lib/media.ts).
//
//   node scripts/loops/record.mjs cs50-ai          [another folder to write to]
//
// A scene is one HTML file with no dependencies that draws any moment of its
// loop on demand: it sets window.loop = { width, height, seconds, fps,
// render(phase) }, with phase from 0 to 1 and render(1) the same picture as
// render(0). Frame by frame, not in real time: every frame asks for its phase
// and takes a still, so the clip is sharp and loops without a seam whatever
// the machine's speed. Its background is the card's own, so it uses the site's
// colours under their names in app/globals.css (--card, --fg-rgb, an accent…
// and --tint for .frag-stage's tint); they are read from there on every
// recording, and the copies in the scene only serve to open it by hand.
//
// Needs Playwright (with its Chromium) and ffmpeg on the machine; neither is a
// dependency of the site. Encoded as the other cards' clips are (encode.mjs).
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { encodeLoop } from "./encode.mjs";

const { chromium } = createRequire(import.meta.url)("playwright");
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const THEMES = ["light", "dark"];

const id = process.argv[2];
const scene = join(HERE, `${id}.html`);
if (!id || !existsSync(scene)) {
  console.error(`Usage: node scripts/loops/record.mjs <project id> [folder]   (there is no scene ${id ?? ""}.html in scripts/loops/)`);
  process.exit(1);
}
const out = process.argv[3] ? resolve(process.argv[3]) : join(ROOT, "public", "media", "projects", id);

// The site's colours, per theme: every custom property of the two token blocks
// of app/globals.css, and the opacity of the tint at the top of a project card.
const css = readFileSync(join(ROOT, "app", "globals.css"), "utf8");
function tokens(theme) {
  const block = css.match(new RegExp(`\\[data-theme="${theme}"\\]\\s*\\{([^}]*)\\}`))?.[1];
  const tint = css.match(new RegExp(`${theme === "dark" ? '\\[data-theme="dark"\\] ' : "\\n"}\\.frag-stage\\s*\\{[^}]*rgb\\(var\\(--d-rgb\\) / ([\\d.]+)\\)`))?.[1];
  if (!block || !tint) throw new Error(`app/globals.css: no ${theme} tokens or no .frag-stage tint where they used to be`);
  return { ...Object.fromEntries([...block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])), "--tint": tint };
}

const browser = await chromium.launch();
for (const theme of THEMES) {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  page.on("pageerror", (e) => {
    throw e;
  });
  await page.goto(`${pathToFileURL(scene)}?theme=${theme}&phase=0`);
  const { width, height, seconds, fps } = await page.evaluate((vars) => {
    for (const [name, value] of Object.entries(vars)) document.documentElement.style.setProperty(name, value);
    window.loop.retheme?.();
    const { width, height, seconds, fps } = window.loop;
    return { width, height, seconds, fps };
  }, tokens(theme));
  await page.setViewportSize({ width, height });
  const count = Math.round(seconds * fps);
  const frames = mkdtempSync(join(tmpdir(), "loop-"));
  for (let i = 0; i < count; i++) {
    await page.evaluate((phase) => window.loop.render(phase), i / count);
    await page.screenshot({ path: join(frames, `f_${String(i).padStart(4, "0")}.png`), clip: { x: 0, y: 0, width, height } });
  }
  await page.close();
  mkdirSync(out, { recursive: true });
  encodeLoop(frames, join(out, `loop-${theme}`), fps);
  rmSync(frames, { recursive: true, force: true });
  console.log(`${id}  ${theme}  ${width} × ${height}, ${count} frames`);
}
await browser.close();
