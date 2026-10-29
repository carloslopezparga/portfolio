# carloslopezparga — personal site

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind 4 · three.js / React Three Fiber · GSAP · Lenis · Anthropic SDK · @react-pdf/renderer · Cal.com embed · sharp.

`/` (English) and `/es` (Spanish). `/lab` is the motion lab: still reachable and noindexed, but not linked from the site. Approved and pending decisions are in [`DECISIONS.md`](DECISIONS.md).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
npm run todos      # lists every TODO still missing in content/profile.ts
```

## Edit the content

- **Profile:** everything lives in **`content/profile.ts`**, with both languages side by side (`{ en, es }`). Unknown data is a string starting with `TODO:`. It is never shown, and the sentence, metric or card simply disappears until you fill it in.
- **Interface copy:** buttons, labels and agent messages are in `lib/copy.ts`.
- **Agent instructions:** built from the profile in `lib/agent/system-prompt.ts`.

## Logos, photos and demos

- `public/logos/`: company and school logos. Expected names are in [`public/logos/README.md`](public/logos/README.md). If a file is missing, a monogram is shown. The logo also sets the card's brand colour, which is read from the file at build time.
- `public/photos/`: portrait, card photos and the n8n screenshot. Expected names are in [`public/photos/README.md`](public/photos/README.md). If a file is missing, it is left out.
- `content/demos/job-hunt-copilot.txt`: a real CLI run, replayed as an animated terminal. The format is in [`content/demos/README.md`](content/demos/README.md).

## Environment variables (Vercel → Settings → Environment Variables)

| Variable | What for | If missing |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | "Ask my agent" (server only) | the agent answers offline and points to email |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (or Vercel KV's `KV_REST_API_URL` + `KV_REST_API_TOKEN`) | rate limit: 12 questions / 10 min, 60 / day per IP | no rate limit |
| `NEXT_PUBLIC_CALCOM_LINK` | "Book 15 min", e.g. `carlos/15min` or a full Cal.com URL | every booking button is hidden |
| `NEXT_PUBLIC_SITE_URL` | canonical URL for metadata and OG | the Vercel production domain |

## Endpoints

- `POST /api/chat`: the agent. It streams NDJSON and only uses UI tools from the whitelist.
- `GET /api/cv?lang=en|es`: a one-page, ATS-friendly PDF built from the profile.

## Launch checklist

Until launch the site is **not indexable**:
- `robots.txt` disallows everything;
- every page has `noindex` and every response carries `X-Robots-Tag: noindex`;
- `/sitemap.xml` returns 404.

On launch day, set `LAUNCHED = true` in [`lib/site.ts`](lib/site.ts).

## Deploy on Vercel

Import the repo in Vercel. Use the Next.js framework preset with no extra settings, and set the production branch to `main`.
