# AIDEX.lv

Website for **AIDEX.lv**, operated by **GREEN ENERGY SIA**. Residential solar, batteries and installation in Latvia, with a B2B section connected to AIDEX Energy Group (aidex-energy.com).

Built with Astro (static output). There is no client framework: pages ship as static HTML plus small vanilla scripts for the calculator, forms, cookie consent and menu.

```bash
npm install
npm run dev       # http://localhost:4321  →  /lv/
npm run build     # static site in dist/
npm run preview
npm run check     # type-check
```

Hosting: any static host (Netlify, Vercel, Cloudflare Pages, S3 + CDN). `/` redirects to `/lv/`, and `dist/404.html` is the error page.

---

## Development markers

Temporary content (benchmark prices, placeholder company fields, unverified support data) is flagged in the data files, but the markers are **hidden from visitors** by default. To see every "Demo data / Placeholder / [to be confirmed]" marker while reviewing:

```bash
PUBLIC_DEV_MARKERS=1 npm run build && npm run preview
```

Placeholder projects and reviews are not rendered at all until real entries exist.

## Temporary imagery

All images in `src/assets/img` are original renders made with the offline three.js pipeline in `render/` (`render/scenes.js`, `render/batch2.sh`). Replace them with real AIDEX photography via `src/data/media.ts`. Hotspot positions for the system image are in `src/data/hotspots.ts`.

`design-review/` contains the before/after screenshots and the Energum reference screenshots used for the redesign (internal only, not deployed).

## Before public launch

Every item below is still temporary (visible as a marker with `PUBLIC_DEV_MARKERS=1`).

| What | Where | Action |
|---|---|---|
| Company details (reg. no., VAT, address, email, phone, hours) | `src/config/company.ts` | Replace each `placeholder(...)` with the real value |
| Link between GREEN ENERGY SIA and AIDEX Energy Group | `src/config/company.ts` → `group.relationship` | Provide exact legal wording |
| Biomass figure from aidex-energy.com | `group.facts` | Confirm, then set `biomassTonnesConfirmed: true` |
| **Packages, equipment, prices, warranties** (TEMPORARY ENERGUM benchmark) | `src/data/packages.ts` | Replace with AIDEX data, set `source: 'aidex'`, set `BENCHMARK_MODE = false` |
| Government support amounts and conditions | `src/data/support.ts` | Check against the official source, update `lastChecked`, set `verified: true` |
| Calculator assumptions | `src/data/calculator.ts` | Have engineering tune yield, prices and self-use shares |
| Projects | `src/data/projects.ts` | Add real, client-approved projects and set `placeholder: false` |
| Reviews | `src/data/testimonials.ts` | Genuine reviews only (or Google Reviews, see file) |
| Photography | `src/assets/img/*` + `src/data/media.ts` | Replace the renders with real photos, set `temporary: false` |
| Logo | `src/components/Logo.astro`, `public/favicon.svg` | Swap in the official AIDEX logo |
| Lead form endpoint | `src/config/company.ts` → `integrations.leadEndpoint` | POST JSON endpoint (CRM, Formspree, own API). While empty the form runs in dev mode and sends nothing |
| Analytics / Meta Pixel | `integrations.googleAnalyticsId`, `metaPixelId` | Optional. These load only after consent |
| Legal texts | `src/content/legal/index.ts` | Drafts. Have a lawyer review them. Confirm the retention period and the group-company wording |
| Hero "free estimate / reply within working days" promises | `src/i18n/*.ts` → `final.points` | Confirm these are real service commitments |

To find what is left: `grep -rn "PLACEHOLDER\|TEMPORARY\|placeholder: true\|verified: false" src`

---

## Architecture

```
src/
  config/company.ts      Legal entity, contacts, integrations. Single source for footer, legal pages, JSON-LD
  config/site.ts         Production origin (canonical / hreflang / sitemap)
  data/                  All commercial content: packages, equipment, support, calculator, projects,
                         testimonials, FAQ, media registry
  i18n/                  lv.ts (source) · ru.ts · en.ts (typed against lv) · routes.ts (localized slugs)
  content/legal/         Privacy, Cookies, Terms, Legal info in LV/RU/EN
  components/            UI. components/home/* are the homepage sections, reused on inner pages
  views/                 One view per page type
  pages/[lang]/[...slug].astro   One router that generates every /lv|ru|en/… page
  scripts/               consent.ts · lead-form.ts · main.ts
  lib/                   calc.ts (the calculator model, shared by server and browser) · seo.ts · images.ts
render/                  Offline three.js renderer for the temporary imagery (not deployed)
```

### Multilingual
- URLs: `/lv/…`, `/ru/…`, `/en/…` with translated slugs (`src/i18n/routes.ts`). Latvian is the default.
- Every page outputs `<html lang>`, canonical, `hreflang` for lv/ru/en plus `x-default` (→ lv), translated title/description, and `og:locale` with alternates.
- The language switcher links to the same page in the other language.
- `ru.ts` and `en.ts` are typed as `Dict`, so a missing key fails the build.

### Cookie consent (GDPR / ePrivacy)
- The first layer offers **Accept all**, **Reject non-essential** and **Manage preferences**, with equal visual weight.
- Nothing non-essential loads before a choice is made. Google Consent Mode v2 starts with everything denied.
- The choice is stored in the first-party `aidex_consent` cookie and localStorage for 6 months. Bumping `CONSENT_VERSION` asks everyone again.
- **Cookie settings** in the footer and on the legal pages reopens the preferences at any time.
- Withdrawing consent deletes that category's `_ga*`, `_fbp` and similar cookies, then reloads the page.
- To add a new opt-in script, use `<script type="text/plain" data-consent="analytics" data-src="…">`.

### Lead form
There are four steps: address, consumption (kWh, € or "don't know"), interests and contact. Validation messages are localized. The form includes a honeypot field. It prefills from `?package=…&battery=1&kwh=…`, which the package cards and calculator set. A privacy notice links to the Privacy Policy in the current language. There is no bundled marketing consent. If newsletters are added later, use a separate, optional, unticked checkbox.

### SEO
Per-language titles and descriptions. JSON-LD covers Organization/LocalBusiness (verified fields only), WebSite, Service, BreadcrumbList and FAQPage on the FAQ page. `sitemap.xml` includes hreflang alternates; `robots.txt` is generated too. The heading structure is one H1 per page.

### Performance
Images are AVIF/WebP with responsive `srcset` and art direction for the portrait mobile hero. Everything below the fold is lazy-loaded. Fonts are self-hosted (no Google Fonts request) and split by subset, including Latvian and Cyrillic. JavaScript totals roughly 15 KB. Motion respects `prefers-reduced-motion`.

Lighthouse (`/lv/`, after the v2 redesign): mobile 91 / 100 / 100 / 100, desktop 100 / 100 / 100 / 100.
