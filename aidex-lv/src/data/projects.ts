/**
 * PROJECTS / CASE STUDIES
 * ---------------------------------------------------------------------------
 * PLACEHOLDER entries only. They exist so the gallery layout can be reviewed
 * and are rendered with a visible "Example layout" marker while
 * `placeholder: true`. Do NOT present them as real AIDEX projects.
 * Replace with real, client-approved projects (and photography) before launch.
 */
import type { Localized } from './packages';
import type { MediaKey } from './media';

export interface Project {
  id: string;
  placeholder: boolean;
  segment: 'home' | 'business';
  location: Localized;
  capacityKw: number | null;
  panel: string;
  inverter: string;
  battery: string | null;
  annualProductionKwh: number | null;
  description: Localized;
  images: MediaKey[];
}

const tbc: Localized = { lv: 'Tiks precizēts', ru: 'Будет уточнено', en: 'To be confirmed' };

export const projects: Project[] = [
  {
    id: 'p1', placeholder: true, segment: 'home',
    location: { lv: 'Pierīga', ru: 'Пририжье', en: 'Riga region' },
    capacityKw: null, panel: '—', inverter: '—', battery: '—', annualProductionKwh: null,
    description: { lv: 'Vieta reālam privātmājas projektam ar fotogrāfijām.', ru: 'Место для реального проекта частного дома с фотографиями.', en: 'Space for a real residential project with photography.' },
    images: ['hero'],
  },
  {
    id: 'p2', placeholder: true, segment: 'home',
    location: { lv: 'Vidzeme', ru: 'Видземе', en: 'Vidzeme' },
    capacityKw: null, panel: '—', inverter: '—', battery: null, annualProductionKwh: null,
    description: tbc, images: ['homeDay'],
  },
  {
    id: 'p3', placeholder: true, segment: 'business',
    location: { lv: 'Loģistikas centrs', ru: 'Логистический центр', en: 'Logistics centre' },
    capacityKw: null, panel: '—', inverter: '—', battery: null, annualProductionKwh: null,
    description: tbc, images: ['commercialRoof'],
  },
  {
    id: 'p4', placeholder: true, segment: 'home',
    location: { lv: 'Kurzeme', ru: 'Курземе', en: 'Kurzeme' },
    capacityKw: null, panel: '—', inverter: '—', battery: '—', annualProductionKwh: null,
    description: tbc, images: ['roofDetail'],
  },
  {
    id: 'p5', placeholder: true, segment: 'home',
    location: { lv: 'Zemgale', ru: 'Земгале', en: 'Zemgale' },
    capacityKw: null, panel: '—', inverter: '—', battery: '—', annualProductionKwh: null,
    description: tbc, images: ['batteryRoom'],
  },
];
