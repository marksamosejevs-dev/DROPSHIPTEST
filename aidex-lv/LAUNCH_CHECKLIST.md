# AIDEX.lv — launch checklist

The site is production-ready apart from the business facts and approvals below. None of them may be invented, so each one needs your input. Where the input goes is shown in brackets.

## 1. Required before publishing

**Company details** (`src/config/company.ts` → `company`)
- [ ] Registration number (Uzņēmumu reģistra Nr.).
- [ ] VAT number, if registered.
- [ ] Registered address, and the office address if it is different.
- [ ] Public phone and public e-mail. A data-protection e-mail is optional; it falls back to the public e-mail.
- [ ] Working hours in LV, RU and EN.

Until these are filled, the footer, contact page and legal pages show **no company data**: placeholders are hidden from visitors. A site without them is not ready to publish.

**Enquiry destination** (see `LEADS.md`)
- [ ] Netlify Forms is used automatically on Netlify builds. In Netlify: **Forms → Enable form detection**, redeploy, add an e-mail notification, then send a real test enquiry.
- [ ] Give the receiving e-mail address.
- [ ] Until this is done, the form says openly that requests are not being sent. It never shows a false "Thank you".

**Legal approval** (`src/content/legal/index.ts`)
- [ ] A lawyer reviews the Privacy Policy, Cookie Policy, Terms and Legal information. They are drafts and are not marked as approved.
- [ ] Confirm the retention period for enquiries (currently "12 months", marked for confirmation).
- [ ] Name the data processors: the hosting provider (Netlify), the form or e-mail service, and any CRM.
- [ ] Supply the exact wording for the relationship between GREEN ENERGY SIA and AIDEX Energy Group (`groupRelationship` → `legal`, `schema`, `confirmed`).
- [ ] Supply the exact wording for the relationship between AIDEX and SUNPRO POWER (`ecosystem.relationship`). Until then, AIDEX is never called an "official" or "exclusive" representative.

**Brand**
- [ ] Official AIDEX logo as SVG (header, footer, favicon). See `IMAGE_REQUIREMENTS.md`.

## 2. Content to confirm (currently shown in a neutral or qualified form)

- [ ] **Government support (EKII)** — `src/data/support.ts`. The amounts (up to €4,000 / €2,500 / €6,500), the 5 kWh condition and the 2029-12-31 deadline come from public reporting and are **not verified**, so they are **hidden** on the site (only the programme name and "we confirm the amount in your quote" are shown). Verify them against the official source, fill `internal`, and set `verified: true` to show them.
- [ ] **Package inverter and battery** — only generic sizes are shown: hybrid inverter 6 / 8 / 12 kW, battery 16 kWh. These sizes came from the earlier benchmark, so engineering should confirm them, and SUNPRO models should be linked once confirmed (`SUNPRO_EQUIPMENT_REQUEST.md`).
- [ ] **Warranties** — no warranty periods are shown, because AIDEX terms are not confirmed (`defaultWarranty` is all `null`). Supply product, performance, equipment and installation warranty years if you want them shown.
- [ ] **Monitoring app** — the "Why AIDEX" card and process step 6 mention app monitoring. Confirm it is included with the chosen inverter.
- [ ] **"500 000+ tonnes of certified biomass"** (AIDEX Energy Group, from aidex-energy.com) — confirm it, or it should be removed.
- [ ] **FAQ rule of thumb** — "annual kWh ÷ ~950 ≈ system kW" and "900–1,000 kWh per kW per year" (general Latvian yield figures). Engineering should confirm. (The calculator has been removed.)
- [ ] **Service promises removed** — "free estimate", "reply within working days" and "installation 1–3 days" were removed because they were unconfirmed. Tell me if any of them is a real commitment, and I can restore it.

## 3. Optional

- [ ] Real photography to replace the illustrative 3D renders (`IMAGE_REQUIREMENTS.md`). The legal information page states that images are visualisations. Projects and reviews stay hidden until real, consented entries exist.
- [ ] Analytics (`integrations.googleAnalyticsId` / `metaPixelId`). When an ID is set, the cookie consent banner and footer settings link turn on automatically. Until then the site sets no cookies and shows no banner.
- [ ] A `main` branch, if you want Netlify to deploy from `main` rather than `claude/wizardly-gates-kes9a9`.

## 4. Publishing

Follow `DEPLOY_NETLIFY.md`. Do not set `PUBLIC_DEV_MARKERS` in production. After DNS is live, verify the actual site using the checklist in that file.
