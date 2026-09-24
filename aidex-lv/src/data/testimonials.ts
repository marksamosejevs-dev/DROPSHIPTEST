/**
 * CUSTOMER REVIEWS
 * ---------------------------------------------------------------------------
 * Only genuine reviews, published with the customer's permission. There are
 * none yet, so the reviews section is not rendered at all (no placeholders).
 * It appears automatically as soon as one entry has `published: true`.
 *
 * Fields
 *   name        As the customer agreed to be shown, e.g. 'Jānis K.'
 *   location    Town / municipality
 *   project     Optional slug from src/data/projects.ts → links to the case study
 *   system      Optional short system label if there is no project page, e.g. '8 kW + 10 kWh'
 *   text        The review in the language it was written (`lang`); add
 *               `translations` only if the customer approved them
 *   rating      1–5, or null if the source has no rating
 *   photo       Optional file in src/assets/reviews/ (customer's consent required)
 *   source      Where it was published; `sourceUrl` links to the original
 *   date        'YYYY-MM-DD'
 *
 * Google Reviews: set integrations.googlePlaceId in src/config/company.ts and
 * map the Places API reviews to this shape at build time (source: 'google').
 */
import type { ImageMetadata } from 'astro';
import type { Locale } from '../i18n/routes';

export interface Review {
  id: string;
  published: boolean;
  consent: boolean;
  name: string;
  location: string;
  project?: string | null;
  system?: string | null;
  lang: Locale;
  text: string;
  translations?: Partial<Record<Locale, string>>;
  rating: 1 | 2 | 3 | 4 | 5 | null;
  photo?: string | null;
  source: 'google' | 'facebook' | 'direct' | 'other';
  sourceUrl?: string | null;
  date: string;
}

export const reviews: Review[] = [
  /* TEMPLATE
  {
    id: 'r-2026-01', published: true, consent: true,
    name: 'Jānis K.', location: 'Jūrmala', project: 'jurmala-10kw', system: null,
    lang: 'lv', text: '…', translations: {},
    rating: 5, photo: null, source: 'google', sourceUrl: 'https://…', date: '2026-09-01',
  },
  */
];

const photos = import.meta.glob<{ default: ImageMetadata }>('../assets/reviews/*.{jpg,jpeg,png,webp,avif}', { eager: true });
export const reviewPhoto = (r: Review) => (r.photo ? photos[`../assets/reviews/${r.photo}`]?.default ?? null : null);

export const visibleReviews = () => reviews.filter((r) => r.published && r.consent);
/** Text in the visitor's language when an approved translation exists, else the original. */
export const reviewText = (r: Review, lang: Locale) => ({ text: r.translations?.[lang] ?? r.text, original: !r.translations?.[lang] && r.lang !== lang ? r.lang : null });
