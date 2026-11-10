import { CLOUD_SIZE, posterSVG } from "@/lib/chip-cloud";
import { figureSVG } from "@/lib/figure-cloud";

/**
 * SVG posters of the point cloud, prerendered at build time from the same
 * generators as the WebGL scene. The chip: the sphere (the scene's first
 * frame, shown until it takes over), and the assembled chip and its cores
 * (reduced motion, no JavaScript, no WebGL); -d is the desktop cloud, -m the
 * phone one. The other figures (desktop only): each at rest, plus the bar
 * chart's coloured dots (-c).
 */
const FILES: Record<string, () => string> = {
  "sphere-d.svg": () => posterSVG(CLOUD_SIZE.desktop, "sphere"),
  "sphere-m.svg": () => posterSVG(CLOUD_SIZE.mobile, "sphere"),
  "still-d.svg": () => posterSVG(CLOUD_SIZE.desktop, "still"),
  "still-m.svg": () => posterSVG(CLOUD_SIZE.mobile, "still"),
  "cores-d.svg": () => posterSVG(CLOUD_SIZE.desktop, "cores"),
  "cores-m.svg": () => posterSVG(CLOUD_SIZE.mobile, "cores"),
  "bars-d.svg": () => figureSVG("bars", CLOUD_SIZE.desktop, "ink"),
  "bars-c.svg": () => figureSVG("bars", CLOUD_SIZE.desktop, "colour"),
  "gears-d.svg": () => figureSVG("gears", CLOUD_SIZE.desktop, "ink"),
  "globe-d.svg": () => figureSVG("globe", CLOUD_SIZE.desktop, "ink"),
};

export function generateStaticParams() {
  return Object.keys(FILES).map((file) => ({ file }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const make = Object.hasOwn(FILES, file) ? FILES[file] : undefined;
  if (!make) return new Response("Not found", { status: 404 });
  return new Response(make(), {
    headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=86400, s-maxage=31536000" },
  });
}
