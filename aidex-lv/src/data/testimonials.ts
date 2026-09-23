/**
 * TESTIMONIALS / REVIEWS
 * ---------------------------------------------------------------------------
 * No real reviews have been supplied yet. The entries below are clearly
 * labelled PLACEHOLDERS and render with a visible marker. Never replace them
 * with invented reviews — only with genuine, consented customer feedback.
 *
 * Future Google Reviews integration: set integrations.googlePlaceId in
 * src/config/company.ts and implement fetchGoogleReviews() at build time
 * (Places API "place details → reviews"), mapping results to `Testimonial`
 * with source: 'google'. Components already render `source` and `rating`.
 */
import type { Localized } from './packages';

export interface Testimonial {
  id: string;
  placeholder: boolean;
  name: string;
  location: Localized;
  photo?: string;
  system: Localized;
  text: Localized;
  rating: number | null; // 1–5
  source: 'google' | 'direct' | 'facebook' | null;
  date?: string;
}

const ph = (id: string): Testimonial => ({
  id, placeholder: true, name: '—',
  location: { lv: 'Atrašanās vieta', ru: 'Местоположение', en: 'Location' },
  system: { lv: 'Sistēma: tiks norādīta', ru: 'Система: будет указана', en: 'System: to be added' },
  text: {
    lv: 'Šeit tiks publicēta reāla klienta atsauksme pēc saskaņošanas ar klientu.',
    ru: 'Здесь будет опубликован реальный отзыв клиента после согласования с ним.',
    en: 'A genuine customer review will be published here once approved by the customer.',
  },
  rating: null, source: null,
});

export const testimonials: Testimonial[] = [ph('t1'), ph('t2'), ph('t3')];
