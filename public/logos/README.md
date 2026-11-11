# Logos

| File | Used for | Tile |
| --- | --- | --- |
| `prophero.png` | PropHero | fills the tile (own background) |
| `grupo-lalala.png` | Grupo Lalala | on white |
| `classy-night-society.png` | Classy Night Society | fills the tile |
| `upm.png` | ETSII-UPM | fills the tile |
| `retamar.png` | Colegio Retamar | on white, edge to edge (`bleed`: the file has its own margin) |
| `cs50.png` | CS50 / HarvardX (Harvard shield) | on white (transparent) |
| `induforum.(svg|png)` | Induforum 2027 | not uploaded yet: the monogram "IF" is shown |

`.svg`, `.png`, `.webp` and `.jpg` all work. Each entry's `brand.tile` in `content/profile.ts` says whether the logo fills its tile (`"fill"`, for logos with their own background) or sits on white (`"white"`). Tiles are rounded with a hairline border (#E8E8ED).

**The logo also sets the card's colour.** The site reads the brand colour from the file at build time (the most frequent saturated fill of an SVG, or the dominant saturated colour of a PNG/JPG) and derives two tones from it, one per theme, both AA on the cards. Until the logo exists, `brand.color` is used. To keep a colour regardless of the logo (Grupo Lalala's logo is black and white, so its accent is a fixed Apple orange #FF9F0A), set `fixed: true`.
