# AIDEX.lv — photography and image requirements

All images on the site are temporary 3D renders. Each one is a single entry in
`src/data/media.ts`, so a real photo replaces a render without any layout change.
Send the photos, and each goes into the slot listed below.

## General rules for every photo

- **Format:** JPG (quality 90+) or lossless PNG/TIFF. Supply the original camera export; the site makes AVIF/WebP versions automatically.
- **Resolution:** at least the minimum listed. Larger is better. Never upscale.
- **Real AIDEX installations only.** No stock photos presented as AIDEX work. If a stock photo is used for mood, it must not show installations.
- **Season and light:** Latvian setting (pine, birch, meadow), late spring to early autumn, golden hour or bright overcast. Avoid harsh midday light and snow.
- **Panels:** all-black modules, clean, with straight rows. No visible cable mess, tools or scaffolding (except in the installation shots).
- **People:** only with written consent. No recognisable children. Car number plates and house numbers must be blurred.
- **Text overlay:** several slots carry text on top of the photo (marked "overlay"). Keep the listed area calm (sky, lawn, dark facade) with no important detail there.
- **Rights:** we need the right to use each photo on the website, in ads and on social media, plus the photographer's name if credit is required.

## Shot list

| # | Website section | Desktop crop | Mobile crop | Minimum size | Subject | People | Priority |
|---|---|---|---|---|---|---|---|
| 1 | **Homepage hero** (`hero`) — full-screen with overlay | 16:9 landscape | Delivered as #2 | 3000 × 1690 | Modern private house with an AIDEX system, roof and panels clearly visible; house in the right or left third. Overlay area: the centre, which carries the headline, price and buttons, so keep it calm (sky, trees). | No | **CRITICAL** |
| 2 | **Homepage hero, mobile** (`heroPortrait`) — overlay | — | 9:16 portrait | 1440 × 2560 | Same house or scene shot vertically: roof in the upper middle, calm lawn or foreground in the lower half. The headline and buttons sit on the bottom 55 %. | No | **CRITICAL** |
| 3 | **Package card 6 kW** (`pkg6`) — overlay | ≈ 3:4 portrait (card) | ≈ 2:3 portrait | 1600 × 2000 | Smaller house or cottage with about 12 panels. Roof in the upper half; the lower 45 % is covered by the price text. | No | **HIGH** |
| 4 | **Package card 8 kW** (`pkg8`), recommended package — overlay | ≈ 3:4 | ≈ 2:3 | 1600 × 2000 | Typical family house with about 16 panels. Also used in the B2B "Home" stage and on the packages page header. | No | **HIGH** |
| 5 | **Package card 10 kW** (`pkg10`) — overlay | ≈ 3:4 | ≈ 2:3 | 1600 × 2000 | Larger house with about 20 panels. Also used in "Why AIDEX" and on the solar page header. | No | **HIGH** |
| 6 | **Package card Max / 12 kW+** (`pkgMax`) — overlay | ≈ 3:4 | ≈ 2:3 | 1600 × 2000 | Large house, farm building or ground-mounted array. | No | OPTIONAL |
| 7 | **System hotspots** (`hotspot`) — clickable pins | 16:9 landscape | 4:3 centre crop | 2800 × 1600 | One house shot so that the **roof panels, the inverter, the battery and the EV charger are all visible** (e.g. a garage or technical wall with the door open, and panels above). After the photo is supplied, the pin coordinates are re-measured in `src/data/hotspots.ts`. | No | **HIGH** |
| 8 | **Battery installation** (`batteryRoom`) | 4:3 landscape | 4:3 | 2000 × 1500 | Close-up of an installed inverter and battery stack on a technical-room wall, with tidy cabling and good light. | Optional (installer's hands or back) | **HIGH** |
| 9 | **Commercial roof** (`commercialRoof`), B2B stage 2 | 16:10 landscape | 16:10 | 2400 × 1500 | Real commercial or industrial rooftop array (warehouse, factory). A drone shot is ideal. | No | **HIGH** |
| 10 | **Group / large-scale** (`solarField`), B2B stage 3 and business page | 16:10 landscape | 16:10 | 2400 × 1500 | Ground-mounted solar park or an AIDEX Energy Group project. Only an image the group has approved for use. | No | **HIGH** |
| 11 | **Social sharing image** (derived from #1) | 1200 × 630 | — | from #1 | Generated automatically from the hero image. Supply a separate image only if the hero crop does not work. | — | OPTIONAL |
| 12 | **About page / team** (currently reuses the hero) | 16:9 | 4:5 | 2400 × 1350 | Team at a real installation or at the office, in work clothes with the AIDEX logo if available. | **Yes, with consent** | OPTIONAL |
| 13 | **Installation process** (optional future use in "6 steps") | 3:2 | 4:5 | 2400 × 1600 | Survey on the roof, mounting rails, panel lifting, electrician at the switchboard, handover with the app. | Yes, with consent; workers in safety gear | OPTIONAL |
| 14 | **Monitoring app** (the "Why AIDEX" card is currently an illustration) | 4:3 | 4:3 | 1600 × 1200 | Real screenshot of the monitoring app used for AIDEX systems, with no personal data. | No | OPTIONAL |
| 15 | **Day / night illustration** (`isoDay`, `isoNight`) | 16:9, transparent PNG | same | 1500 × 850 | This is an illustration, not a photo. The current render can stay. Replace only with a commissioned illustration in the same angle, as a day and night pair. | No | OPTIONAL |

## Per-project photos (case studies)

Each real project becomes its own page. Put the photos in `src/assets/projects/<project-slug>/`. The first photo listed is the cover.

| Photo | Crop | Minimum size | Subject | Priority |
|---|---|---|---|---|
| Cover | 16:9 (page) and 4:3 (card) — keep the subject centred | 2400 × 1500 | Whole house with panels, from the best angle | **CRITICAL** for each project |
| Roof detail | 4:3 | 2000 × 1500 | Panel rows and mounting close-up | HIGH |
| Technical room | 4:3 | 2000 × 1500 | Inverter and battery as installed | HIGH (if a battery is installed) |
| Drone / wide view | 16:9 | 2400 × 1350 | Context with the garden and surroundings | OPTIONAL |
| Customer with system | 4:5 | 1600 × 2000 | Only with written consent | OPTIONAL |

Minimum per project: 1 photo. Recommended: 3–5.

## Reviews

- Optional customer portrait in `src/assets/reviews/<review-id>.jpg`: square, at least 400 × 400, consent required.
- Without a photo, the review shows the customer's initial.

## Logo and brand files (not photos, but needed)

| File | Format | Used in | Priority |
|---|---|---|---|
| AIDEX logo, horizontal, dark and light versions | SVG, plus PNG at 1000 px wide | Header, footer, social image | **CRITICAL** |
| AIDEX symbol / icon only | SVG, plus square PNG at 512 × 512 | Favicon, app icon | **CRITICAL** |
| AIDEX Energy Group logo and usage permission | SVG | B2B section (optional) | OPTIONAL |
| Brand colours and font, if a brand book exists | PDF | Design tokens in `src/styles/global.css` | HIGH |

## How replacement works (technical)

1. Put the file in `src/assets/img/` (e.g. `hero.jpg`).
2. In `src/data/media.ts`, change the import for that slot and set `temporary: false`. Update the `alt` text in LV/RU/EN to describe the real photo.
3. Hotspot photo only: re-measure the four pin positions (in %) in `src/data/hotspots.ts`.
4. Run `npm run build`. Every size and format is generated automatically.
