/** XML sitemap with hreflang alternates for every localized page. */
import type { APIRoute } from 'astro';
import { locales, routes, path, type RouteKey } from '../i18n/routes';
import { abs } from '../lib/seo';
import { LEGAL_UPDATED } from '../config/company';
import { visibleProjects } from '../data/projects';
import { projectPath } from '../lib/projects';

const priority: Partial<Record<RouteKey, string>> = { home: '1.0', packages: '0.9', solar: '0.9', batteries: '0.8', offer: '0.8', calculator: '0.8', support: '0.8', business: '0.7' };
const legal: RouteKey[] = ['privacy', 'cookies', 'terms', 'legal'];

export const GET: APIRoute = () => {
  const urls = (Object.keys(routes) as RouteKey[]).flatMap((key) =>
    locales.map((lang) => {
      const alts = [...locales.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${abs(path(key, l))}"/>`), `<xhtml:link rel="alternate" hreflang="x-default" href="${abs(path(key, 'lv'))}"/>`].join('');
      return `<url><loc>${abs(path(key, lang))}</loc>${alts}<lastmod>${LEGAL_UPDATED}</lastmod><priority>${priority[key] ?? (legal.includes(key) ? '0.3' : '0.6')}</priority></url>`;
    }),
  );
  // Case studies (development samples are never listed).
  for (const p of visibleProjects().filter((x) => !x.sample)) {
    for (const lang of locales) {
      const alts = [...locales.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${abs(projectPath(p, l))}"/>`), `<xhtml:link rel="alternate" hreflang="x-default" href="${abs(projectPath(p, 'lv'))}"/>`].join('');
      urls.push(`<url><loc>${abs(projectPath(p, lang))}</loc>${alts}<priority>0.5</priority></url>`);
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
