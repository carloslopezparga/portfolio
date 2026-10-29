# Logos

Drop the files here with exactly these names (`.svg` preferred, `.png` / `.webp` / `.jpg` also work):

| File | Used for |
| --- | --- |
| `prophero.svg` | PropHero (Right now, Experience) |
| `grupo-lalala.svg` | Grupo Lalala (Experience) |
| `induforum.svg` | Induforum 2027 (Experience) |
| `classy-night-society.svg` | Classy Night Society (Experience) |
| `upm.svg` | ETSII-UPM (Right now, Education) |
| `retamar.svg` | Colegio Retamar (Education) |
| `cs50.svg` | CS50 (Education) |

Missing files are fine: a monogram (PH, GL, IF, CNS, UPM, R, CS50) is shown on the same tile.

**The logo also sets the card's colour.** The site reads the brand colour from the file at build time (the most frequent saturated fill of an SVG, or the dominant saturated colour of a PNG/JPG) and derives two tones from it, one per theme, both AA on the cards. Until the logo exists, the fallback colour in `content/profile.ts` (`brand.color`) is used. Square-ish marks on a transparent background work best.
