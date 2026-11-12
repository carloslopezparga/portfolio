// Records the looping clip at the top of a project card from a canvas scene in
// this folder (<project id>.html): one clip per theme, as .mp4 and .webm, plus a
// poster (the first frame), into public/media/projects/<id>/ (loop-light.*,
// loop-dark.*). The site then shows it on that card (lib/media.ts, projectLoop).
//
//   node scripts/loops/record.mjs                  every scene in this folder
//   node scripts/loops/record.mjs mail-autopilot   only that one
//
// Needs Playwright (with its Chromium) and ffmpeg on the machine; neither is a
// dependency of the site. Nothing is served: the scene is opened as a file.
//
// What a scene has to do:
//   - window.loop.render(phase) draws the frame for a phase from 0 to 1, and
//     depends on nothing else (seeded, no clock): phase 1 is phase 0, so the
//     last frame runs into the first and the clip loops without a seam.
//   - window.loop.stage is the selector of what is recorded, WIDTH × HEIGHT CSS px.
//   - the theme is <html data-theme="light | dark">.
// Frame by frame, not in real time: each frame asks for its phase and takes a
// still, so the clip is the same whatever the machine's speed.
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { encode, FPS, frameFile, HEIGHT, SECONDS, WIDTH } from "./encode.mjs";

const { chromium } = createRequire(import.meta.url)("playwright");
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "..", "public", "media", "projects");
const THEMES = ["light", "dark"];
const FRAMES = SECONDS * FPS;

const scenes = readdirSync(HERE).filter((f) => f.endsWith(".html")).map((f) => f.slice(0, -5));
const ids = process.argv.length > 2 ? process.argv.slice(2) : scenes;
for (const id of ids) if (!scenes.includes(id)) throw new Error(`No scene called ${id}.html in scripts/loops/ (there: ${scenes.join(", ") || "none"})`);

const browser = await chromium.launch();
for (const id of ids) {
  const page = await browser.newPage({ viewport: { width: WIDTH + 64, height: HEIGHT + 64 }, deviceScaleFactor: 1 });
  // a scene that fails while loading says why here (a frame that fails makes its own render() call throw)
  let broken = null;
  page.on("pageerror", (e) => (broken ??= e));
  await page.goto(pathToFileURL(join(HERE, `${id}.html`)).href, { waitUntil: "load" });
  if (broken) throw broken;
  const stage = page.locator(await page.evaluate(() => window.loop.stage));
  const box = await stage.boundingBox();
  if (box?.width !== WIDTH || box?.height !== HEIGHT) throw new Error(`${id}: the stage is ${box?.width} × ${box?.height} px, not ${WIDTH} × ${HEIGHT}`);
  for (const theme of THEMES) {
    await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    const frames = mkdtempSync(join(tmpdir(), "loop-"));
    for (let i = 0; i < FRAMES; i++) {
      await page.evaluate((phase) => window.loop.render(phase), i / FRAMES);
      await stage.screenshot({ path: join(frames, frameFile(i)) });
    }
    const dir = join(OUT, id);
    mkdirSync(dir, { recursive: true });
    encode(frames, join(dir, `loop-${theme}`));
    rmSync(frames, { recursive: true, force: true });
    console.log(`${id}  ${theme}`);
  }
  await page.close();
}
await browser.close();
