# AIDEX.lv

Website for **AIDEX.lv**, operated by **GREEN ENERGY SIA**. Residential solar, batteries and installation in Latvia, with a B2B section connected to AIDEX Energy Group (aidex-energy.com).

Built with Astro (static output). There is no client framework: pages ship as static HTML plus small vanilla scripts for the request form, package toggle, hotspots, cookie consent and menu. There is no calculator (removed before launch; old calculator URLs 301 to the packages page in `netlify.toml`).

```bash
npm install
npm run dev       # http://localhost:4321  →  /lv/
npm run build     # static site in dist/
npm run preview
npm run check     # type-check
```

Hosting: **Netlify** (configured in `../netlify.toml`; see **DEPLOY_NETLIFY.md**). `/` redirects to `/lv/`, and `dist/404.html` is the error page. Node.js ≥ 22.12.

**Pricing policy:** AIDEX.lv publishes **no prices**: none for products, packages, installation or batteries, and no €/W. Packages are technical configurations (kWp, panel count, SUNPRO model), and every call to action is "Pieprasīt piedāvājumu / Запросить предложение / Request a Quote". The calculator sizes a system (kW, production, panels, area, battery); it does not compute cost, savings or payback. `render/functest.mjs` fails the build check if package prices reappear in `dist/`.

**Before launch:** see **LAUNCH_CHECKLIST.md**.

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

Everything that still needs business input is listed in **LAUNCH_CHECKLIST.md**: company details, enquiry destination, legal approval, SUNPRO inverter and battery, and warranties. To find remaining placeholders: `grep -rn "placeholder(\|verified: false\|confirmed: false" src`

### QA scripts (with `npm run preview` running)

```bash
node render/functest.mjs      # no-tracking/consent, packages, hotspots, calculator-removal, hidden unverified subsidy figures, form paths (disabled/500/200/Netlify), menu, hreflang, no-prices/no-€ audit
node render/linkcheck.mjs     # broken internal links, anchors and missing assets in dist/
node render/netlifycheck.mjs  # builds as Netlify (NETLIFY=true) and verifies Netlify Forms markup/fields
node render/qa.mjs            # every page × 4 widths: overflow, broken links/assets, canonical/hreflang, h1, titles
node render/i18ncheck.mjs     # Latvian text leaking into RU/EN pages
```

---

## Architecture

```
src/
  config/company.ts      Legal entity, contacts, group relationship wording. Single source for footer, legal pages, JSON-LD
  config/leads.ts        Lead-form destination (disabled / Web3Forms / Formspree / HubSpot / webhook)
  config/site.ts         Production origin (canonical / hreflang / sitemap)
  data/                  All commercial content: packages, equipment (manufacturer specs), support, projects, reviews
                         (testimonials.ts), FAQ, media registry
  assets/projects/       Real project photos, one folder per project slug
  i18n/                  lv.ts (source) · ru.ts · en.ts (typed against lv) · routes.ts (localized slugs)
  content/legal/         Privacy, Cookies, Terms, Legal info in LV/RU/EN
  components/            UI. components/home/* are the homepage sections, reused on inner pages
  views/                 One view per page type
  pages/[lang]/[...slug].astro   One router that generates every /lv|ru|en/… page
  pages/[lang]/[section]/[item].astro   Case-study pages (data/projects.ts) and equipment pages (data/equipment.ts)
  scripts/               consent.ts · lead-form.ts · main.ts
  lib/                   seo.ts · images.ts
render/                  Offline three.js renderer for the temporary imagery (not deployed)
```

### Multilingual
- URLs: `/lv/…`, `/ru/…`, `/en/…` with translated slugs (`src/i18n/routes.ts`). Latvian is the default.
- Every page outputs `<html lang>`, canonical, `hreflang` for lv/ru/en plus `x-default` (→ lv), translated title/description, and `og:locale` with alternates.
- The language switcher links to the same page in the other language.
- `ru.ts` and `en.ts` are typed as `Dict`, so a missing key fails the build.

### Cookie consent (GDPR / ePrivacy)
- **The banner is shown only when a non-essential integration is configured** (`integrations.googleAnalyticsId` / `metaPixelId` → `CONSENT_REQUIRED`). With none configured, the site sets no cookies, shows no banner, and the Cookie Policy says so.
- When enabled, the first layer offers **Accept all**, **Reject non-essential** and **Manage preferences**, with equal visual weight.
- Nothing non-essential loads before a choice is made. Google Consent Mode v2 starts with everything denied.
- The choice is stored in the first-party `aidex_consent` cookie and localStorage for 6 months. Bumping `CONSENT_VERSION` asks everyone again.
- **Cookie settings** in the footer and on the legal pages reopens the preferences at any time.
- Withdrawing consent deletes that category's `_ga*`, `_fbp` and similar cookies, then reloads the page.
- To add a new opt-in script, use `<script type="text/plain" data-consent="analytics" data-src="…">`.

### Lead form
On Netlify builds it submits to Netlify Forms automatically; other destinations can be chosen with build environment variables (`PUBLIC_LEAD_PROVIDER` …; see LEADS.md). There are four steps: address, consumption (kWh or "don't know"), interests and package selection, then contact and an optional comment. Validation messages are localized. Spam protection: a honeypot field and a minimum fill time. While no destination is configured, the form says so up front and never shows a false success. It prefills from `?package=…&battery=1&kwh=…`, which the package cards and calculator set. A privacy notice links to the Privacy Policy in the current language. There is no bundled marketing consent. If newsletters are added later, use a separate, optional, unticked checkbox.

### SEO
Per-language titles and descriptions. JSON-LD covers Organization/LocalBusiness (verified fields only), WebSite, Service, BreadcrumbList and FAQPage on the FAQ page. `sitemap.xml` includes hreflang alternates; `robots.txt` is generated too. The heading structure is one H1 per page.

### Performance
Images are AVIF/WebP with responsive `srcset` and art direction for the portrait mobile hero. Everything below the fold is lazy-loaded. Fonts are self-hosted (no Google Fonts request) and split by subset, including Latvian and Cyrillic. JavaScript totals roughly 15 KB. Motion respects `prefers-reduced-motion`.

Lighthouse (`/lv/`, final polish): mobile 90–92 / 100 / 100 / 100, desktop 100 / 100 / 100 / 100.
