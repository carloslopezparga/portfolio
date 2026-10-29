# Photos

Drop the files here with exactly these names (`.jpg`, `.jpeg`, `.png` or `.webp`). Anything missing is simply left out: the card or panel renders without a photo, nothing breaks.

| File | Where it appears |
| --- | --- |
| `carlos.jpg` | Portrait in Contact |
| `events-1.jpg` | Grupo Lalala detail card (Trajectory) |
| `dana.jpg` | DANA card in Beyond (and its Trajectory card once it has dates) |
| `mentor.jpg` | ETSII Mentor card in Beyond (same) |
| `volunteering-1.jpg` | Food Bank card in Beyond (same) |
| `volunteering-2.jpg` | South Africa card in Beyond (same) |
| `n8n-flow.png` | "Real workflow" toggle of the Email on autopilot project (Systems) |

Which photo belongs to which item is set in `content/profile.ts` (`photo:` on each experience / leadership entry, `screenshot:` on projects). Alt texts use the item's title.

Tips: JPG around 2000 px on the long side is plenty — `next/image` serves resized AVIF/WebP automatically. Cards in Beyond crop to 16:9, the portrait to 4:5.
