/**
 * PROJECTS / CASE STUDIES
 * ---------------------------------------------------------------------------
 * Each entry automatically becomes:
 *   - a card in the projects gallery (/lv/musu-darbi/ …) and on the homepage,
 *   - its own case-study page: /lv/musu-darbi/<slug>/, /ru/nashi-proekty/<slug>/,
 *     /en/projects/<slug>/ (with hreflang, breadcrumbs and sitemap entry).
 *
 * HOW TO ADD A REAL PROJECT
 *   1. Put the photos in  src/assets/projects/<slug>/  (JPG/PNG/WebP, ≥ 2400 px
 *      wide). The first file in `photos` is the cover image.
 *   2. Copy the template at the bottom of this file and fill what you know.
 *      Unknown → null (that line is simply not shown).
 *   3. Set `published: true` ONLY when the client has approved publication
 *      (`consent: true`). Unpublished projects are never rendered or built.
 *
 * Nothing here may be invented. No real projects have been supplied yet.
 */
import type { ImageMetadata } from 'astro';
import type { Localized } from './packages';
import { media, type MediaKey } from './media';
import { SHOW_DEV_MARKERS } from '../config/site';

export interface Project {
  /** URL slug, lowercase latin, e.g. 'jurmala-10kw-2026'. Never change after publishing. */
  slug: string;
  published: boolean;
  /** Client has approved publication of photos and details. */
  consent: boolean;
  segment: 'home' | 'business';
  /** Town / municipality. A plain string is used in every language. */
  location: string | Localized;
  systemKw: number;
  panels: { model: string; count?: number | null } | null;
  inverter: { model: string } | null;
  battery: { kwh: number; model?: string | null } | null;
  /** 'YYYY-MM' or 'YYYY-MM-DD'. */
  installedOn: string | null;
  /** Measured or designed annual production, kWh (optional). */
  annualProductionKwh?: number | null;
  /** Optional custom headline; otherwise generated from the system data. */
  title?: Localized | null;
  /** One or two sentences shown on the card and under the page headline. */
  summary?: Localized | null;
  /** Optional case-study text blocks. */
  story?: { challenge?: Localized; solution?: Localized; result?: Localized } | null;
  /** Filenames in src/assets/projects/<slug>/ (first = cover). */
  photos: string[];
  /** Optional alt texts per photo (same order as `photos`). */
  photoAlt?: (Localized | null)[];
  /** Internal: development sample, rendered ONLY with PUBLIC_DEV_MARKERS=1. */
  sample?: boolean;
}

export const projects: Project[] = [
  // Development sample — shows how a case study will look. Never public.
  {
    slug: 'piemers-jurmala', sample: true, published: false, consent: false, segment: 'home',
    location: 'Jūrmala', systemKw: 10,
    panels: { model: '[panel model]', count: null }, inverter: { model: '[inverter model]' }, battery: { kwh: 10, model: null },
    installedOn: null, annualProductionKwh: null,
    summary: { lv: 'Izkārtojuma paraugs. Šeit būs īss reāla projekta apraksts.', ru: 'Образец макета. Здесь будет краткое описание реального проекта.', en: 'Layout sample. A short description of a real project goes here.' },
    story: null,
    photos: ['media:pkg10', 'media:hotspot', 'media:batteryRoom'],
  },
];

/* ---------------------------------------------------------------------------
 * TEMPLATE
 * ---------------------------------------------------------------------------
  {
    slug: 'jurmala-10kw',
    published: true, consent: true, segment: 'home',
    location: 'Jūrmala',
    systemKw: 10,
    panels: { model: 'SUNPRO POWER SP440-N108M10', count: 23 },
    inverter: { model: 'Growatt …' },
    battery: { kwh: 10, model: '…' },          // or null
    installedOn: '2026-08',
    annualProductionKwh: null,
    summary: { lv: '…', ru: '…', en: '…' },     // optional
    story: null,                               // optional { challenge, solution, result }
    photos: ['01.jpg', '02.jpg', '03.jpg'],
  },
 * ------------------------------------------------------------------------ */

// ---- Resolution helpers (no data below) -----------------------------------
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/projects/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', { eager: true });

export interface ProjectPhoto { src: ImageMetadata; alt: Localized | null }

/** Resolves photo references to images ('media:key' or a file in the project folder). */
export function projectPhotos(p: Project): ProjectPhoto[] {
  return p.photos.flatMap((ref, i) => {
    const alt = p.photoAlt?.[i] ?? null;
    if (ref.startsWith('media:')) {
      const m = media[ref.slice(6) as MediaKey];
      return m ? [{ src: m.src, alt: alt ?? m.alt }] : [];
    }
    const f = files[`../assets/projects/${p.slug}/${ref}`];
    if (!f) throw new Error(`[projects] ${p.slug}: photo not found → src/assets/projects/${p.slug}/${ref}`);
    return [{ src: f.default, alt }];
  });
}

/** Projects that may be shown: published + consented + at least one photo (samples only in dev). */
export const visibleProjects = () =>
  projects.filter((p) => (p.published && p.consent && !p.sample) || (SHOW_DEV_MARKERS && p.sample)).filter((p) => p.photos.length > 0);

export const hasRealProjects = () => projects.some((p) => p.published && p.consent && !p.sample);
