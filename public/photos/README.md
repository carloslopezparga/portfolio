# Photos

Drop the files here with exactly these names (`.jpg`, `.jpeg`, `.png` or `.webp`). Anything missing is simply left out: the card or panel renders without a photo, nothing breaks.

| File | Where it appears |
| --- | --- |
| `carlos.jpg` | Portrait in Contact |
| `dana.jpg` | DANA card in Leadership & impact |
| `mentor.jpg` | ETSII Mentor card in Leadership & impact |
| `volunteering-1.jpg` | Food Bank card in Leadership & impact |
| `volunteering-2.jpg` | South Africa card in Leadership & impact |
| `n8n-flow.png` | "Real workflow" toggle of the Email on autopilot project (Projects) |
| `events-1.jpg` | Reserved for Grupo Lalala; not shown in the current design (experience cards are text only) |

Which photo belongs to which item is set in `content/profile.ts` (`photo:` on each experience / leadership entry, `screenshot:` on projects). Alt texts use the item's title.

Tips: JPG around 2000 px on the long side is plenty — `next/image` serves resized AVIF/WebP automatically. Leadership cards crop to 16:9, the portrait to 4:5.
