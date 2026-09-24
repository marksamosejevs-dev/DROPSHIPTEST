/**
 * CENTRAL COMPANY CONFIGURATION — GREEN ENERGY SIA (operator of AIDEX.lv)
 * ---------------------------------------------------------------------------
 * The ONLY place for company facts. Footer, header phone, contact page,
 * About, legal information, Privacy Policy, Terms, cookie banner and
 * structured data (JSON-LD) all read from this file.
 *
 * Values wrapped in placeholder() are NOT verified company facts. They are
 * hidden from visitors (and from structured data); with PUBLIC_DEV_MARKERS=1
 * they render as "[to be confirmed]". Replace each placeholder('…') with the
 * real string before launch — nothing else needs to change.
 */
import type { Localized } from '../data/packages';

export type Placeholder = { placeholder: true; note: string };
export type Field = string | Placeholder;

export const placeholder = (note: string): Placeholder => ({ placeholder: true, note });
export const isPlaceholder = (v: unknown): v is Placeholder =>
  typeof v === 'object' && v !== null && (v as Placeholder).placeholder === true;
/** Returns the value, or undefined when it is still a placeholder. */
export const known = (v: Field): string | undefined => (isPlaceholder(v) ? undefined : v);

export const company = {
  /** Legal operator of the website (confirmed by the client brief). */
  legalName: 'GREEN ENERGY SIA',
  /** Public brand. */
  brand: 'AIDEX',
  /** Public domain / website. */
  domain: 'AIDEX.lv',
  website: 'https://aidex.lv/',

  registrationNumber: placeholder('Uzņēmumu reģistra numurs (registration number)'),
  vatNumber: placeholder('PVN maksātāja numurs (VAT number, LV…)'),
  registeredAddress: placeholder('Juridiskā adrese (registered address)'),
  /** Leave as placeholder (or set to '') if the office is the registered address. */
  officeAddress: placeholder('Biroja / showroom adrese, ja atšķiras (optional)'),
  email: placeholder('Public e-mail, e.g. info@aidex.lv'),
  /** Optional separate data-protection contact; falls back to `email`. */
  privacyEmail: placeholder('Data-protection e-mail, e.g. privacy@aidex.lv (optional)'),
  /** Human-readable phone, e.g. '+371 2000 0000'. The tel: link is derived. */
  phone: placeholder('Public phone, e.g. +371 …'),
  openingHours: {
    lv: placeholder('Darba laiks, piem. P–Pk 9:00–18:00'),
    ru: placeholder('Часы работы, напр. Пн–Пт 9:00–18:00'),
    en: placeholder('Working hours, e.g. Mon–Fri 9:00–18:00'),
  } as Record<'lv' | 'ru' | 'en', Field>,
  bank: placeholder('Bank name and IBAN (optional, for Terms)'),
  /** Electrical works / installer licences, certifications. Leave empty until verified. */
  licences: [] as string[],

  social: { facebook: '', instagram: '', linkedin: '' },
} as const;

/** tel: link derived from `company.phone` (undefined while it is a placeholder). */
export const phoneHref = () => known(company.phone)?.replace(/[^\d+]/g, '');
/** Office address only if it is known and differs from the registered address. */
export const officeAddress = () => {
  const o = known(company.officeAddress);
  return o && o !== known(company.registeredAddress) ? o : undefined;
};

/** AIDEX Energy Group — the international business AIDEX.lv is connected to. */
export const group = {
  name: 'AIDEX Energy Group',
  url: 'https://aidex-energy.com/',
  /**
   * Facts taken from the public website aidex-energy.com (as indexed in
   * September 2026). CONFIRM WITH AIDEX before launch.
   */
  facts: {
    headquarters: 'Latvia',
    markets: 'EU & UK',
    /** Stated on aidex-energy.com: "500,000+ tonnes of certified biomass move across the EU and UK". */
    biomassTonnes: '500 000+',
    /** Public claim of the group itself (source: aidex-energy.com). Confirm before launch. */
    biomassTonnesConfirmed: false,
  },
};

/**
 * RELATIONSHIP WORDING — GREEN ENERGY SIA / AIDEX.lv ↔ AIDEX Energy Group
 * ---------------------------------------------------------------------------
 * Every sentence on the site that describes the relationship comes from here
 * (substituted into the translations as {groupRel} / {groupRelShort}).
 * The defaults are deliberately neutral ("connected to"). Replace them with the
 * exact wording approved by legal, then set `confirmed: true`.
 */
export const groupRelationship = {
  confirmed: false,
  /** One sentence used in the B2B section, About, footer and page descriptions. */
  statement: {
    lv: 'AIDEX.lv ir saistīts ar starptautisko AIDEX Energy Group.',
    ru: 'AIDEX.lv связан с международной AIDEX Energy Group.',
    en: 'AIDEX.lv is connected to the international AIDEX Energy Group.',
  } as Localized,
  /** 2–5 words, used under the group name (trust bar). */
  short: {
    lv: 'Saistītais enerģētikas uzņēmums',
    ru: 'Связанная энергетическая компания',
    en: 'Connected energy business',
  } as Localized,
  /** Exact legal description for the Legal information page (hidden until provided). */
  legal: {
    lv: placeholder('Precīzs juridiskās saistības apraksts starp GREEN ENERGY SIA un AIDEX Energy Group'),
    ru: placeholder('Точное юридическое описание связи GREEN ENERGY SIA и AIDEX Energy Group'),
    en: placeholder('Exact legal description of the relationship between GREEN ENERGY SIA and AIDEX Energy Group'),
  } as Record<'lv' | 'ru' | 'en', Field>,
  /**
   * How the relationship is expressed in structured data. Keep `null` until
   * confirmed: 'parentOrganization' (GREEN ENERGY SIA is a subsidiary),
   * 'memberOf' (member of the group) or 'sameAs-link' (only a related link).
   */
  schema: null as null | 'parentOrganization' | 'memberOf' | 'sameAs-link',
};

/**
 * Integrations. Leave IDs empty to keep the integration fully disabled.
 * Analytics / marketing scripts are loaded ONLY after the visitor consents
 * to the matching cookie category (see src/scripts/consent.ts).
 * The lead-form destination lives in src/config/leads.ts.
 */
export const integrations = {
  googleAnalyticsId: '', // e.g. G-XXXXXXX  → category: analytics
  metaPixelId: '', // e.g. 1234567890   → category: marketing
  /** Future Google Reviews integration (Places API) — see src/data/testimonials.ts */
  googlePlaceId: '',
};

/** Bump when the cookie categories or vendors change: visitors are asked again. */
export const CONSENT_VERSION = 1;
/** Date shown on legal pages. Update whenever a policy changes. */
export const LEGAL_UPDATED = '2026-09-23';
