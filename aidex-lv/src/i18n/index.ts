import lv, { type Dict } from './lv';
import ru from './ru';
import en from './en';
import type { Locale } from './routes';
import type { Localized } from '../data/packages';

export * from './routes';
export type { Dict };

const dictionaries: Record<Locale, Dict> = { lv, ru, en };

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
