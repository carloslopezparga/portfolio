import { CLOUD_SIZE, posterSVG } from "@/lib/chip-cloud";

/**
 * SVG posters of the hero chip's point cloud, prerendered at build time from
 * the same generator as the WebGL scene, so the poster is its first frame:
 * the sphere (shown until the scene takes over), and the assembled chip and
 * its cores (reduced motion, no JavaScript, no WebGL). -d is the desktop
 * cloud, -m the phone one.
 */
const FILES = {
  "sphere-d.svg": [CLOUD_SIZE.desktop, "sphere"],
  "sphere-m.svg": [CLOUD_SIZE.mobile, "sphere"],
  "still-d.svg": [CLOUD_SIZE.desktop, "still"],
  "still-m.svg": [CLOUD_SIZE.mobile, "still"],
  "cores-d.svg": [CLOUD_SIZE.desktop, "cores"],
  "cores-m.svg": [CLOUD_SIZE.mobile, "cores"],
} as const;

export function generateStaticParams() {
  return Object.keys(FILES).map((file) => ({ file }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const entry = Object.hasOwn(FILES, file) ? FILES[file as keyof typeof FILES] : undefined;
  if (!entry) return new Response("Not found", { status: 404 });
  return new Response(posterSVG(entry[0], entry[1]), {
    headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=86400, s-maxage=31536000" },
  });
}
