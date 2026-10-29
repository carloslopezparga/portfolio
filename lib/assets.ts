import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Hex } from "@/content/types";
import { brandTones, pixelsColor, svgColor, type BrandTones } from "./brand";

const PUBLIC = path.join(process.cwd(), "public");

function logoFile(name: string): string | null {
  for (const ext of ["svg", "png", "webp", "jpg"]) {
    const file = path.join(PUBLIC, "logos", `${name}.${ext}`);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

/** Resolves public/logos/<name>.(svg|png|webp|jpg) — null when the file is missing. */
export function logoSrc(name: string): string | null {
  const file = logoFile(name);
  return file ? `/logos/${path.basename(file)}` : null;
}

/** Accepts "dana" (tries jpg/png/webp) or an exact filename like "n8n-flow.png". */
export function photoSrc(name: string): string | null {
  const candidates = path.extname(name) ? [name] : ["jpg", "jpeg", "png", "webp"].map((e) => `${name}.${e}`);
  for (const file of candidates) {
    if (fs.existsSync(path.join(PUBLIC, "photos", file))) return `/photos/${file}`;
  }
  return null;
}

/** A recorded demo from content/demos/ (by filename), or null when it does not exist. */
export function readDemo(file: string): string | null {
  try {
    return fs.readFileSync(path.join(process.cwd(), "content", "demos", path.basename(file)), "utf8");
  } catch {
    return null;
  }
}

const toneCache = new Map<string, Promise<BrandTones>>();

/**
 * Brand colour read from the logo itself (SVG fills, or the dominant
 * saturated colour of a raster logo); `fallback` until the logo exists.
 * Returned as two AA tones, one per theme.
 */
export function brandOf(logo: string, fallback: Hex): Promise<BrandTones> {
  const key = `${logo}|${fallback}`;
  let p = toneCache.get(key);
  if (!p) {
    p = (async () => {
      const file = logoFile(logo);
      let color: Hex | null = null;
      try {
        if (file?.endsWith(".svg")) color = svgColor(fs.readFileSync(file, "utf8"));
        else if (file) {
          const { default: sharp } = await import("sharp");
          const { data, info } = await sharp(file).resize(48, 48, { fit: "inside" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
          color = pixelsColor(data, info.channels);
        }
      } catch {
        color = null;
      }
      return brandTones(color ?? fallback);
    })();
    toneCache.set(key, p);
  }
  return p;
}
