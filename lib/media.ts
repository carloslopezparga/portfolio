import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cacheLife } from "next/cache";
import { profile } from "@/content/profile";
import type { ExternalMedia, Locale, MediaSection } from "@/content/types";

/** What a card's media strip and the lightbox need, already in one language. */
export type MediaItem =
  | { kind: "image"; src: string; width: number; height: number; caption?: string }
  | { kind: "video"; src: string; poster?: string; caption?: string }
  | { kind: "youtube"; id: string; poster: string; caption?: string }
  | { kind: "vimeo"; id: string; hash?: string; poster?: string; caption?: string };

const ROOT = path.join(process.cwd(), "public", "media");
const IMAGE = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const VIDEO = new Set([".mp4", ".webm"]);
/** "<video name>.poster.jpg" (or png/webp) is the cover of "<video name>.mp4". */
const POSTER = /\.poster\.(jpe?g|png|webp)$/i;

const byName = (a: string, b: string) => a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });

function external(e: ExternalMedia, lang: Locale): MediaItem {
  const caption = e.caption?.[lang];
  if (e.kind === "youtube") return { kind: "youtube", id: e.id, poster: `https://i.ytimg.com/vi/${e.id}/hqdefault.jpg`, caption };
  if (e.kind === "vimeo") return { kind: "vimeo", id: e.id, hash: e.hash, poster: e.poster, caption };
  return { kind: "video", src: e.src, poster: e.poster, caption };
}

/**
 * Everything in public/media/<section>/<folder>/, sorted by file name
 * (01-, 02-…), then the external videos from profile.media. Read once at
 * build time (and again on each daily revalidation); [] when the folder is
 * empty or missing.
 */
export async function mediaFor(section: MediaSection, folder: string, lang: Locale): Promise<MediaItem[]> {
  "use cache";
  cacheLife("max");

  const config = profile.media[`${section}/${folder}`];
  const dir = path.join(ROOT, section, folder);
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir).filter((f) => !f.startsWith(".")).sort(byName);
  } catch {
    files = [];
  }

  const posters = new Map<string, string>();
  for (const f of files) if (POSTER.test(f)) posters.set(f.replace(POSTER, "").toLowerCase(), f);
  const url = (f: string) => `/media/${section}/${folder}/${encodeURIComponent(f)}`;
  const caption = (f: string) => config?.captions?.[f]?.[lang];

  const items: MediaItem[] = [];
  for (const f of files) {
    if (POSTER.test(f)) continue;
    const ext = path.extname(f).toLowerCase();
    if (IMAGE.has(ext)) {
      let width = 4;
      let height = 3;
      try {
        const { default: sharp } = await import("sharp");
        const meta = await sharp(path.join(dir, f)).metadata();
        // Phone photos are often stored sideways with an EXIF rotation.
        const turned = (meta.orientation ?? 1) >= 5;
        width = (turned ? meta.height : meta.width) ?? width;
        height = (turned ? meta.width : meta.height) ?? height;
      } catch {}
      items.push({ kind: "image", src: url(f), width, height, caption: caption(f) });
    } else if (VIDEO.has(ext)) {
      const poster = posters.get(f.slice(0, -ext.length).toLowerCase());
      items.push({ kind: "video", src: url(f), poster: poster ? url(poster) : undefined, caption: caption(f) });
    }
  }
  for (const e of config?.external ?? []) items.push(external(e, lang));
  return items;
}
