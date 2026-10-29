# carloslopezparga — personal site

Next.js (App Router) · TypeScript · Tailwind 4 · Motion · GSAP + ScrollTrigger · Lenis · three.js / React Three Fiber.

> **Status: phase 1 — motion lab.** `/lab` shows every interaction in isolation for review. `/` is a temporary home.
> The full site (sections, AI chat, PDF CV, OG image) is built in phase 2 on top of what gets approved here.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000  ·  lab at /lab
npm run build      # production build
npm run lint
npm run todos      # lists every TODO still missing in content/profile.ts
```

## Edit the content

Everything lives in **`content/profile.ts`** (both languages side by side: `{ en, es }`).
Unknown data is a string starting with `TODO:` — it is never shown; the metric, sentence or whole section simply disappears until you fill it in.

## Logos, photos and demos

- `public/logos/` — company and school logos. Expected names in [`public/logos/README.md`](public/logos/README.md). Missing → monogram.
- `public/photos/` — portrait and gallery. Expected names in [`public/photos/README.md`](public/photos/README.md). Missing → left out.
- `content/demos/job-hunt-copilot.txt` — a real CLI run replayed as an animated terminal. Format in [`content/demos/README.md`](content/demos/README.md).

## Launch checklist

Until launch the site is **not indexable**: `robots.txt` disallows everything, every page has `noindex`, responses carry `X-Robots-Tag: noindex` and there is no sitemap.
On launch day set `LAUNCHED = true` in [`lib/site.ts`](lib/site.ts).

## Deploy on Vercel

Import the repo in Vercel (framework preset: Next.js, no extra settings). Production branch: `main`.
Optional env var: `NEXT_PUBLIC_SITE_URL` (canonical URL; defaults to the Vercel production domain).
Phase 2 adds `ANTHROPIC_API_KEY` and, optionally, `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.
