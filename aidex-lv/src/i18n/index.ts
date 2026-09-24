import lv, { type Dict } from './lv';
import ru from './ru';
import en from './en';
import type { Locale } from './routes';
import type { Localized } from '../data/packages';
import { groupRelationship } from '../config/company';

export * from './routes';
export type { Dict };

/**
 * Company-controlled wording is injected into the translations here, so it is
 * edited in ONE place (src/config/company.ts → groupRelationship):
 *   {groupRel}       → groupRelationship.statement
 *   {groupRelShort}  → groupRelationship.short
 */
function inject<T>(v: T, lang: Locale): T {
  if (typeof v === 'string')
    return v.replace(/\{groupRel\}/g, groupRelationship.statement[lang]).replace(/\{groupRelShort\}/g, groupRelationship.short[lang]) as T;
  if (Array.isArray(v)) return v.map((x) => inject(x, lang)) as T;
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, inject(x, lang)])) as T;
  return v;
}

const dictionaries: Record<Locale, Dict> = { lv: inject(lv, 'lv'), ru: inject(ru, 'ru'), en: inject(en, 'en') };

export const useT = (lang: Locale): Dict => dictionaries[lang];

/** Picks the current language from a { lv, ru, en } object. */
export const l = (v: Localized, lang: Locale) => v[lang];

const intlLocale: Record<Locale, string> = { lv: 'lv-LV', ru: 'ru-RU', en: 'en-IE' };

export const fmtEur = (n: number, lang: Locale) =>
  new Intl.NumberFormat(intlLocale[lang], { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export const fmtNum = (n: number, lang: Locale, digits = 0) =>
  new Intl.NumberFormat(intlLocale[lang], { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(n);

export const fmtDate = (iso: string, lang: Locale) =>
  new Intl.DateTimeFormat(intlLocale[lang], { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso));

export const units: Record<Locale, { kw: string; kwh: string; w: string; pcs: string }> = {
  lv: { kw: 'kW', kwh: 'kWh', w: 'W', pcs: 'gab.' },
  ru: { kw: 'кВт', kwh: 'кВт·ч', w: 'Вт', pcs: 'шт.' },
  en: { kw: 'kW', kwh: 'kWh', w: 'W', pcs: '×' },
};

export const intlLocaleOf = (lang: Locale) => intlLocale[lang];
