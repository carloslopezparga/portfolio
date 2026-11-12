# carloslopezparga — personal site

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind 4 · three.js (the point cloud: the hero chip and, on desktop, the figures it forms further down) · GSAP (one demo) · Motion (⌘K) · Lenis · Anthropic SDK · sharp. Fonts: Plus Jakarta Sans, Inter and Geist Mono (terminal only).

`/` (English) and `/es` (Spanish), light theme by default with a dark one on the toggle. Approved and pending decisions are in [`DECISIONS.md`](DECISIONS.md).

Sections: hero (with the AI chip, a point cloud that goes on to form gears in experience, an open book in education, a funnel, a pipeline and a bar chart in how I work, and a globe in contact), right now, experience, education, how I work (three steps that advance by themselves, each with its figure), projects (one row that scrolls sideways; a looping clip, case study and demo per card), skills (a network in three layers, in 3D), volunteering (a row of cards) and contact.

The points' physics (how the cursor stirs them, the spring that brings them back, the drift) is tuned in `lib/particle-config.ts`; open the site with `?tune=1` for a panel of sliders and a button that copies the values.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
npm run todos      # lists every TODO still missing in content/profile.ts
```

## Edit the content

- **Profile:** everything lives in **`content/profile.ts`**, with both languages side by side (`{ en, es }`). It mirrors the CV, which is the source of truth: when the CV changes, update both. Unknown data is a string starting with `TODO:`. It is never shown, and the sentence, metric or card simply disappears until you fill it in.
- **CV:** `public/cv/CV_Carlos_Lopez_Parga.pdf` (English). Every CV button and the agent's `download_cv` tool download this file. To update it, upload a new PDF with the same name.
- **Interface copy:** buttons, labels and agent messages are in `lib/copy.ts`.
- **Agent instructions:** built from the profile in `lib/agent/system-prompt.ts`.

## Logos, photos and demos

- `public/logos/`: company and school logos. Expected names are in [`public/logos/README.md`](public/logos/README.md). If a file is missing, a monogram is shown. The logo also sets the card's brand colour, which is read from the file at build time.
- `public/media/<section>/<id>/`: photos and videos for each experience, education, project and volunteering card. Files are detected at build time, sorted by name (`01-`, `02-`…) and shown as a thumbnail strip that opens in a lightbox. Captions and external videos (YouTube, Vimeo, Vercel Blob) go in `media` in `content/profile.ts`. Full guide, including how to upload from the GitHub website: [`public/media/README.md`](public/media/README.md).
- `public/media/education/` and `public/media/volunteering/` (the folders themselves, not a card's folder): a video, or photos, shown very faint and grey behind the whole section. Nothing there, no backdrop.
- `public/media/projects/<id>/loop-<lang>-<theme>.(webm|mp4)` and `.poster.jpg`: the looping clip at the top of each project card. `node scripts/record-project-loops.mjs` records them again from the cards' live illustrations (needs Playwright and ffmpeg; see the script). Without clips, a card shows the live illustration.
- `public/media/projects/cooling-agent/loop-<theme>.*`: that card's clip is drawn with code instead (air between a row of racks, as points). The scene is `scripts/loops/cooling-agent.html`, which takes its colours from `app/globals.css`; `node scripts/loops/record.mjs cooling-agent cooling-agent` records it frame by frame. The recorder takes any scene in `scripts/loops/` (`<scene> <project id>`).
- `public/photos/`: the portrait and the n8n screenshot. Details in [`public/photos/README.md`](public/photos/README.md). If a file is missing, it is left out.
- `content/demos/job-hunt-copilot.txt`: a real CLI run, replayed as an animated terminal. The format is in [`content/demos/README.md`](content/demos/README.md).

## Environment variables (Vercel → Settings → Environment Variables)

| Variable | What for | If missing |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | "Ask my agent" (server only) | the agent answers offline and points to email |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (or Vercel KV's `KV_REST_API_URL` + `KV_REST_API_TOKEN`) | rate limit: 12 questions / 10 min, 60 / day per IP | no rate limit |
| `NEXT_PUBLIC_BOOKING_URL` | "Book 15 min": the public page of a Google Calendar appointment schedule (any `https://` URL), opened in a new tab | every booking button is hidden, and the agent has no `open_booking` |
| `NEXT_PUBLIC_SITE_URL` | canonical URL for metadata and OG | the Vercel production domain |

## Endpoints

- `POST /api/chat`: the agent. It streams NDJSON and only uses UI tools from the whitelist.

## Launch checklist

Until launch the site is **not indexable**:
- `robots.txt` disallows everything;
- every page has `noindex` and every response carries `X-Robots-Tag: noindex`;
- `/sitemap.xml` returns 404.

On launch day, set `LAUNCHED = true` in [`lib/site.ts`](lib/site.ts).

## Deploy on Vercel

Import the repo in Vercel. Use the Next.js framework preset with no extra settings, and set the production branch to `main`.
