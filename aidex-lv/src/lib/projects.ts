/** Presentation helpers for case studies (titles, dates, URLs). */
import { routes, type Locale } from '../i18n/routes';
import { useT, fmtNum, units, intlLocaleOf } from '../i18n';
import type { Project } from '../data/projects';

export const projectPath = (p: Project, lang: Locale) => `/${lang}/${routes.projects[lang]}/${p.slug}/`;
export const projectLocation = (p: Project, lang: Locale) => (typeof p.location === 'string' ? p.location : p.location[lang]);

export function projectTitle(p: Project, lang: Locale) {
  if (p.title) return p.title[lang];
  const u = units[lang];
  return useT(lang).projects.auto(`${fmtNum(p.systemKw, lang, 1)} ${u.kw}`, p.battery ? `${fmtNum(p.battery.kwh, lang, 1)} ${u.kwh}` : null);
}

export function projectDate(p: Project, lang: Locale) {
  if (!p.installedOn) return null;
  const [y, m, d] = p.installedOn.split('-').map(Number);
  return new Intl.DateTimeFormat(intlLocaleOf(lang), d ? { year: 'numeric', month: 'long', day: 'numeric' } : m ? { year: 'numeric', month: 'long' } : { year: 'numeric' })
    .format(new Date(y, (m ?? 1) - 1, d ?? 1));
}

/** Spec rows for a project; rows with unknown values are omitted. */
export function projectSpecs(p: Project, lang: Locale) {
  const t = useT(lang).projects.labels;
  const u = units[lang];
  return [
    { k: t.capacity, v: `${fmtNum(p.systemKw, lang, 1)} ${u.kw}` },
    p.panels && { k: t.panel, v: `${p.panels.count ? `${p.panels.count} × ` : ''}${p.panels.model}` },
    p.inverter && { k: t.inverter, v: p.inverter.model },
    p.battery && { k: t.battery, v: `${fmtNum(p.battery.kwh, lang, 1)} ${u.kwh}${p.battery.model ? ` · ${p.battery.model}` : ''}` },
    p.annualProductionKwh && { k: t.production, v: `${fmtNum(p.annualProductionKwh, lang)} ${u.kwh}` },
    projectDate(p, lang) && { k: t.installed, v: projectDate(p, lang)! },
  ].filter(Boolean) as { k: string; v: string }[];
}
