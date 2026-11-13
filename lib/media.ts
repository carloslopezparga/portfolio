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

/** "loop.mp4", "loop.webm", "loop.poster.jpg" (and anything else called loop…): the clip behind a project's card. */
const LOOP = /^loop([-.]|$)/i;

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
    // (a project's loop… files are its card's looping clip, not part of its gallery)
    files = fs.readdirSync(dir).filter((f) => !f.startsWith(".") && !LOOP.test(f)).sort(byName);
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

/** A looping clip: the same video in the formats found, and its still. */
export interface Clip {
  webm?: string;
  mp4?: string;
  poster?: string;
}

function listFiles(dir: string): string[] {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((f) => f.isFile() && !f.name.startsWith("."))
      .map((f) => f.name)
      .sort(byName);
  } catch {
    return [];
  }
}

/** The clip called `base` among `files` ("base.webm", "base.mp4", "base.poster.jpg"), or null when there is no video. */
function clipOf(files: string[], base: string, url: (f: string) => string): Clip | null {
  const find = (re: RegExp) => files.find((f) => f.toLowerCase().startsWith(`${base.toLowerCase()}.`) && re.test(f.slice(base.length)));
  const webm = find(/^\.webm$/i);
  const mp4 = find(/^\.mp4$/i);
  const poster = find(POSTER);
  if (!webm && !mp4) return null;
  return { webm: webm && url(webm), mp4: mp4 && url(mp4), poster: poster && url(poster) };
}

/**
 * The looping clip behind a project's card, from public/media/projects/<id>/:
 * "loop.mp4" and/or "loop.webm", plus an optional "loop.poster.jpg". One per
 * project: the cards are dark in both themes and the clip has no text. null
 * when there is no video: the card keeps its plain background, tinted with its
 * domain's colour. Files called loop… never show up in the card's media strip.
 */
export async function projectLoop(id: string): Promise<Clip | null> {
  "use cache";
  cacheLife("max");
  const files = listFiles(path.join(ROOT, "projects", id));
  return clipOf(files, "loop", (f) => `/media/projects/${id}/${encodeURIComponent(f)}`);
}

/**
 * A section's backdrop: the files directly in public/media/<section>/ (not
 * the ones in a card's folder). Videos (the same name in .webm and .mp4 is
 * one video) or, when there are none, photos. Both empty: no backdrop.
 */
export async function backdropFor(section: MediaSection): Promise<{ videos: Clip[]; images: string[] }> {
  "use cache";
  cacheLife("max");
  const files = listFiles(path.join(ROOT, section));
  const url = (f: string) => `/media/${section}/${encodeURIComponent(f)}`;
  const bases = [...new Set(files.filter((f) => VIDEO.has(path.extname(f).toLowerCase())).map((f) => f.slice(0, -path.extname(f).length)))];
  const videos = bases.map((base) => clipOf(files, base, url)).filter((c): c is Clip => c !== null);
  const images = files.filter((f) => IMAGE.has(path.extname(f).toLowerCase()) && !POSTER.test(f)).map(url);
  return { videos, images };
}
