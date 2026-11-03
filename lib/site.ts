/**
 * Flip to `true` on launch day: removes noindex (robots.txt, meta tags and
 * X-Robots-Tag header) and publishes the sitemap.
 */
export const LAUNCHED = false;

/** Carlos's own CV (English only), uploaded to public/cv/. Every CV button and the agent's download_cv point here. */
export const CV_URL = "/cv/CV_Carlos_Lopez_Parga.pdf";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const robotsMeta = LAUNCHED
  ? { index: true, follow: true }
  : { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } };
