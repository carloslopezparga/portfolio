// How a project card's looping clip is encoded, whichever way it was recorded
// (scripts/record-project-loops.mjs from the cards' live illustrations,
// scripts/loops/record.mjs from a canvas scene): H.264 and VP9 without audio,
// plus the first frame as its poster.
import { execFileSync } from "node:child_process";
import { join } from "node:path";

// BT.709, limited range, and tagged as such: the clip's flat background has to match the card's own colour
const VIDEO = ["-vf", "scale=iw:ih:out_color_matrix=bt709:out_range=tv,format=yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv", "-an"];
const ffmpeg = (...args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });

/** The stills `frames`/f_0000.png, f_0001.png… at `fps` → `base`.mp4, `base`.webm and `base`.poster.jpg. */
export function encodeLoop(frames, base, fps) {
  const input = ["-framerate", String(fps), "-i", join(frames, "f_%04d.png")];
  ffmpeg(...input, ...VIDEO, "-c:v", "libx264", "-preset", "veryslow", "-crf", "27", "-movflags", "+faststart", `${base}.mp4`);
  ffmpeg(...input, ...VIDEO, "-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0", "-deadline", "good", "-cpu-used", "1", "-row-mt", "1", `${base}.webm`);
  ffmpeg("-i", join(frames, "f_0000.png"), "-frames:v", "1", "-q:v", "4", `${base}.poster.jpg`);
}
