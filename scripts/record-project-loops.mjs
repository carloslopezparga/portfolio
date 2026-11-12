// Records the looping clip at the top of each project card from the card's own
// live illustration (the floating fragments of interface, components/sections/ProjectArt.tsx):
// one clip per project, language and theme, as .webm and .mp4, plus a poster, into
// public/media/projects/<id>/ (loop-<lang>-<theme>.*). The site then shows the clip
// instead of the live illustration (lib/media.ts, projectLoop).
//
//   npm run build && npm run start          (in another terminal)
//   node scripts/record-project-loops.mjs   [http://localhost:3000]
//
// Needs Playwright (with its Chromium) and ffmpeg on the machine; neither is a
// dependency of the site. Frame by frame, not in real time: every frame sets the
// animations' clock and the pointer's parallax and takes a still, so the clip is
// sharp and loops without a seam whatever the machine's speed.
//
// A project whose clip is drawn with code (a scene in scripts/loops/<id>.html,
// recorded by scripts/loops/record.mjs) is left alone.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = createRequire(import.meta.url)("playwright");
const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "public", "media", "projects");
const SECONDS = 7;
const FPS = 24;
// the illustration is 520 × 325 CSS px on a desktop card: 1.6× gives 832 × 520, sharp enough on a 2× screen at half the weight
const SCALE = 1.6;
const LANGS = [["en", "/"], ["es", "/es"]];
const THEMES = ["light", "dark"];
// BT.709, limited range, and tagged as such: the clip's flat background has to match the card's own colour
const VIDEO = ["-vf", "scale=iw:ih:out_color_matrix=bt709:out_range=tv,format=yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv", "-an"];
const ffmpeg = (...args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });

const browser = await chromium.launch();
for (const [lang, path] of LANGS) {
  for (const theme of THEMES) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: SCALE });
    await context.addInitScript((t) => localStorage.setItem("theme", t), theme);
    const page = await context.newPage();
    await page.goto(`${BASE}${path}?live-art`, { waitUntil: "load" });
    await page.evaluate(() => document.getElementById("projects").scrollIntoView());
    await page.waitForSelector("#projects .frag-stage");
    await page.waitForTimeout(1200);
    // one period of the float is the clip's length; nothing else on screen over the cards
    await page.addStyleTag({ content: `.frag { animation-duration: ${SECONDS / 2}s !important; transition: none !important } .reveal { opacity: 1 !important; transition: none !important } header, .fig-layer, .skip-link { visibility: hidden !important }` });
    const ids = await page.$$eval("#projects article[data-target-id]", (els) => els.map((el) => el.dataset.targetId));
    for (const id of ids) {
      if (existsSync(join(HERE, "loops", `${id}.html`))) continue;
      const stage = page.locator(`#projects article[data-target-id="${id}"] .frag-stage`);
      await stage.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await stage.evaluate((el) => {
        el.__anims = el.getAnimations({ subtree: true });
        el.__anims.forEach((a) => a.pause());
        el.__from = el.__anims.map((a) => Number(a.currentTime));
      });
      const frames = mkdtempSync(join(tmpdir(), "loop-"));
      for (let i = 0; i < SECONDS * FPS; i++) {
        await stage.evaluate(
          (el, [t, period]) => {
            el.__anims.forEach((a, k) => (a.currentTime = el.__from[k] + t * 1000));
            // the pointer, going round the card once
            el.style.setProperty("--px", (0.85 * Math.cos((2 * Math.PI * t) / period)).toFixed(4));
            el.style.setProperty("--py", (0.85 * Math.sin((2 * Math.PI * t) / period)).toFixed(4));
          },
          [i / FPS, SECONDS],
        );
        await stage.screenshot({ path: join(frames, `f_${String(i).padStart(4, "0")}.png`) });
      }
      const dir = join(OUT, id);
      mkdirSync(dir, { recursive: true });
      const base = join(dir, `loop-${lang}-${theme}`);
      const input = ["-framerate", String(FPS), "-i", join(frames, "f_%04d.png")];
      ffmpeg(...input, ...VIDEO, "-c:v", "libx264", "-preset", "veryslow", "-crf", "27", "-movflags", "+faststart", `${base}.mp4`);
      ffmpeg(...input, ...VIDEO, "-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0", "-deadline", "good", "-cpu-used", "1", "-row-mt", "1", `${base}.webm`);
      ffmpeg("-i", join(frames, "f_0000.png"), "-frames:v", "1", "-q:v", "4", `${base}.poster.jpg`);
      rmSync(frames, { recursive: true, force: true });
      console.log(`${id}  ${lang}  ${theme}`);
    }
    await context.close();
  }
}
await browser.close();
