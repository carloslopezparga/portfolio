import "server-only";
import fs from "node:fs";
import path from "node:path";

const PUBLIC = path.join(process.cwd(), "public");

/** Resolves public/logos/<name>.(svg|png|webp|jpg) — null when the file is missing. */
export function logoSrc(name: string): string | null {
  for (const ext of ["svg", "png", "webp", "jpg"]) {
    if (fs.existsSync(path.join(PUBLIC, "logos", `${name}.${ext}`))) return `/logos/${name}.${ext}`;
  }
  return null;
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
