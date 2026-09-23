/**
 * Multilingual URL architecture: /lv/, /ru/, /en/ with localized slugs.
 * Latvian is the default language (the root URL redirects to /lv/).
 */
export const locales = ['lv', 'ru', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'lv';

export const localeMeta: Record<Locale, { label: string; name: string; htmlLang: string; ogLocale: string }> = {
  lv: { label: 'LV', name: 'Latviešu', htmlLang: 'lv', ogLocale: 'lv_LV' },
  ru: { label: 'RU', name: 'Русский', htmlLang: 'ru', ogLocale: 'ru_RU' },
  en: { label: 'EN', name: 'English', htmlLang: 'en', ogLocale: 'en_GB' },
};

export const routes = {
  home: { lv: '', ru: '', en: '' },
  solar: { lv: 'saules-paneli', ru: 'solnechnye-paneli', en: 'solar-panels' },
  batteries: { lv: 'akumulatori', ru: 'akkumulyatory', en: 'batteries' },
  packages: { lv: 'komplekti-un-cenas', ru: 'komplekty-i-ceny', en: 'packages-and-prices' },
  calculator: { lv: 'kalkulators', ru: 'kalkulyator', en: 'calculator' },
  support: { lv: 'valsts-atbalsts', ru: 'gosudarstvennaya-podderzhka', en: 'government-support' },
  projects: { lv: 'musu-darbi', ru: 'nashi-proekty', en: 'projects' },
  business: { lv: 'uznemumiem', ru: 'dlya-biznesa', en: 'business' },
  about: { lv: 'par-mums', ru: 'o-nas', en: 'about' },
  faq: { lv: 'biezak-uzdotie-jautajumi', ru: 'voprosy-i-otvety', en: 'faq' },
  contact: { lv: 'kontakti', ru: 'kontakty', en: 'contact' },
  offer: { lv: 'sanemt-piedavajumu', ru: 'poluchit-predlozhenie', en: 'get-an-offer' },
  privacy: { lv: 'privatuma-politika', ru: 'politika-konfidencialnosti', en: 'privacy-policy' },
  cookies: { lv: 'sikdatnu-politika', ru: 'politika-cookie', en: 'cookie-policy' },
  terms: { lv: 'noteikumi', ru: 'usloviya', en: 'terms' },
  legal: { lv: 'juridiska-informacija', ru: 'yuridicheskaya-informaciya', en: 'legal-information' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof routes;

export function path(key: RouteKey, lang: Locale, hash?: string): string {
  const slug = routes[key][lang];
  return `/${lang}/${slug ? slug + '/' : ''}${hash ? '#' + hash : ''}`;
}

export function isLocale(v: string | undefined): v is Locale {
  return !!v && (locales as readonly string[]).includes(v);
}

export function routeFromSlug(lang: Locale, slug: string): RouteKey | undefined {
  return (Object.keys(routes) as RouteKey[]).find((k) => routes[k][lang] === slug);
}
