/**
 * CENTRAL COMPANY CONFIGURATION — GREEN ENERGY SIA (operator of AIDEX.lv)
 * ---------------------------------------------------------------------------
 * Every legally relevant area of the site (footer, legal pages, forms, cookie
 * banner, contact page, structured data) reads from this file.
 *
 * Values wrapped in placeholder() are NOT verified company facts. They render
 * as a visible "[to be confirmed]" marker on the site and are skipped in
 * structured data. Replace them with the real values before public launch.
 * Search the codebase for `PLACEHOLDER` to find every remaining item.
 */

export type Placeholder = { placeholder: true; note: string };
export type Field = string | Placeholder;

export const placeholder = (note: string): Placeholder => ({ placeholder: true, note });
export const isPlaceholder = (v: unknown): v is Placeholder =>
  typeof v === 'object' && v !== null && (v as Placeholder).placeholder === true;
/** Returns the value, or undefined when it is still a placeholder. */
export const known = (v: Field): string | undefined => (isPlaceholder(v) ? undefined : v);

export const company = {
  /** Legal operator of the website. Confirmed by the client brief. */
  legalName: 'GREEN ENERGY SIA',
  /** Public brand / domain. */
  brand: 'AIDEX',
  domain: 'AIDEX.lv',

  registrationNumber: placeholder('PLACEHOLDER — Uzņēmumu reģistra numurs (registration number)'),
  vatNumber: placeholder('PLACEHOLDER — PVN maksātāja numurs (VAT number, LV…)'),
  registeredAddress: placeholder('PLACEHOLDER — Juridiskā adrese (registered address)'),
  officeAddress: placeholder('PLACEHOLDER — Biroja / showroom adrese (optional)'),
  email: placeholder('PLACEHOLDER — Public e-mail, e.g. info@aidex.lv'),
  privacyEmail: placeholder('PLACEHOLDER — Data-protection contact e-mail, e.g. privacy@aidex.lv'),
  phone: placeholder('PLACEHOLDER — Public phone, e.g. +371 …'),
  /** Phone in E.164 without spaces, used for tel: links. */
  phoneHref: placeholder('PLACEHOLDER — Phone for tel: link, e.g. +371XXXXXXXX'),
  openingHours: placeholder('PLACEHOLDER — Working hours, e.g. Mon–Fri 9:00–18:00'),
  bank: placeholder('PLACEHOLDER — Bank name and IBAN (optional, for Terms)'),
  /** Electrical works / installer licences, certifications. Leave empty until verified. */
  licences: [] as string[],

  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
  },
} as const;

/** AIDEX Energy Group — the international business AIDEX.lv is connected to. */
export const group = {
  name: 'AIDEX Energy Group',
  url: 'https://aidex-energy.com/',
  /**
   * Facts below are taken from the public website aidex-energy.com (as indexed
   * in September 2026). CONFIRM WITH AIDEX before launch — the site operator is
   * responsible for any public statement.
   */
  facts: {
    headquarters: 'Latvia',
    markets: 'EU & UK',
    /** Stated on aidex-energy.com: "500,000+ tonnes of certified biomass move across the EU and UK". */
    biomassTonnes: '500 000+',
    biomassTonnesConfirmed: false,
  },
  /**
   * Explanation of the legal relationship between GREEN ENERGY SIA and
   * AIDEX Energy Group. PLACEHOLDER — describe precisely (e.g. "member of",
   * "partner of", "licensed brand of") once confirmed by legal.
   */
  relationship: placeholder('PLACEHOLDER — legal relationship between GREEN ENERGY SIA and AIDEX Energy Group'),
} as const;

/**
 * Integrations. Leave IDs empty to keep the integration fully disabled.
 * Analytics / marketing scripts are loaded ONLY after the visitor consents
 * to the matching cookie category (see src/scripts/consent.ts).
 */
export const integrations = {
  /** Lead form endpoint (POST, JSON). Empty = development mode (no data is sent). */
  leadEndpoint: '',
  googleAnalyticsId: '', // e.g. G-XXXXXXX  → category: analytics
  metaPixelId: '', // e.g. 1234567890   → category: marketing
  /** Future Google Reviews integration (Places API) — see src/data/testimonials.ts */
  googlePlaceId: '',
};

/** Bump when the cookie categories or vendors change: visitors are asked again. */
export const CONSENT_VERSION = 1;
/** Date shown on legal pages. Update whenever a policy changes. */
export const LEGAL_UPDATED = '2026-09-23';
