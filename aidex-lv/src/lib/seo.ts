import { company, group, known } from '../config/company';
import { locales, path, type Locale, type RouteKey } from '../i18n/routes';
import { SITE_URL } from '../config/site';
import { faq } from '../data/faq';

export const abs = (p: string) => new URL(p, SITE_URL).toString();

export function alternates(key: RouteKey) {
  return [
    ...locales.map((lang) => ({ hreflang: lang, href: abs(path(key, lang)) })),
    { hreflang: 'x-default', href: abs(path(key, 'lv')) },
  ];
}

/** Organization / LocalBusiness — only verified (non-placeholder) fields are emitted. */
export function organizationLd(lang: Locale) {
  const email = known(company.email);
  const phone = known(company.phone);
  const address = known(company.registeredAddress);
  const vat = known(company.vatNumber);
  const reg = known(company.registrationNumber);
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': abs('/#organization'),
    name: company.brand,
    legalName: company.legalName,
    url: abs(path('home', lang)),
    logo: abs('/favicon.svg'),
    areaServed: { '@type': 'Country', name: 'Latvia' },
    parentOrganization: { '@type': 'Organization', name: group.name, url: group.url },
    ...(email && { email }),
    ...(phone && { telephone: phone }),
    ...(address && { address: { '@type': 'PostalAddress', streetAddress: address, addressCountry: 'LV' } }),
    ...(vat && { vatID: vat }),
    ...(reg && { identifier: reg }),
    knowsLanguage: ['lv', 'ru', 'en'],
  };
}

export function websiteLd(lang: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': abs('/#website'),
    name: 'AIDEX',
    url: abs(path('home', lang)),
    inLanguage: lang,
    publisher: { '@id': abs('/#organization') },
  };
}

export function faqLd(lang: Locale, ids?: string[]) {
  const items = ids ? faq.filter((f) => ids.includes(f.id)) : faq;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: lang,
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q[lang], acceptedAnswer: { '@type': 'Answer', text: f.a[lang] } })),
  };
}

export function breadcrumbLd(lang: Locale, trail: { name: string; key: RouteKey }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: abs(path(t.key, lang)) })),
  };
}

export function serviceLd(lang: Locale, name: string, description: string, key: RouteKey) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType: name,
    url: abs(path(key, lang)),
    areaServed: { '@type': 'Country', name: 'Latvia' },
    provider: { '@id': abs('/#organization') },
    inLanguage: lang,
  };
}
