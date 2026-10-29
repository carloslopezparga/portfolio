import { LAUNCHED, SITE_URL } from "@/lib/site";

/** No sitemap until launch (404); afterwards both languages with hreflang alternates. */
export function GET() {
  if (!LAUNCHED) return new Response("Not found", { status: 404 });
  const alt = `<xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/"/><xhtml:link rel="alternate" hreflang="es" href="${SITE_URL}/es"/><xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/"/>`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<url><loc>${SITE_URL}/</loc>${alt}</url>
<url><loc>${SITE_URL}/es</loc>${alt}</url>
</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
