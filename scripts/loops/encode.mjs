// How the looping clip at the top of a project card is encoded. Shared by the two
// recorders, so every clip has the same length, frame rate and colour:
// scripts/record-project-loops.mjs (clips recorded from a card's live illustration)
// and scripts/loops/record.mjs (clips drawn by a canvas scene in this folder).
// Needs ffmpeg on the machine.
import { execFileSync } from "node:child_process";
import { join } from "node:path";

export const SECONDS = 7;
export const FPS = 24;
/** The clip's size: a 16:10 card top (520 × 325 CSS px on a desktop card) at 1.6×, sharp enough on a 2× screen at half the weight. */
export const WIDTH = 832;
export const HEIGHT = 520;

// BT.709, limited range, and tagged as such: the clip's flat background has to match the card's own colour
const VIDEO = ["-vf", "scale=iw:ih:out_color_matrix=bt709:out_range=tv,format=yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv", "-an"];
const ffmpeg = (...args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });

/** The name of frame i inside its folder. */
export const frameFile = (i) => `f_${String(i).padStart(4, "0")}.png`;

/** A folder of frames (frameFile(0), frameFile(1)…) → `base`.mp4 (H.264), `base`.webm (VP9) and `base`.poster.jpg (the first frame). */
export function encode(frames, base) {
  const input = ["-framerate", String(FPS), "-i", join(frames, "f_%04d.png")];
  ffmpeg(...input, ...VIDEO, "-c:v", "libx264", "-preset", "veryslow", "-crf", "27", "-movflags", "+faststart", `${base}.mp4`);
  ffmpeg(...input, ...VIDEO, "-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0", "-deadline", "good", "-cpu-used", "1", "-row-mt", "1", `${base}.webm`);
  ffmpeg("-i", join(frames, frameFile(0)), "-frames:v", "1", "-q:v", "4", `${base}.poster.jpg`);
}
