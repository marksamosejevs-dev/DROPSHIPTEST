/**
 * GOVERNMENT SUPPORT PROGRAMMES — the only source of support amounts/conditions.
 * ---------------------------------------------------------------------------
 * Components, package prices and the calculator all read from here.
 *
 *  Public fields  → shown on the site (name, amounts, conditions, deadline).
 *  `internal`     → verification record for the team. NEVER rendered.
 *
 * Before launch: verify every programme with the official administrator,
 * fill `internal`, update `internal.lastVerified` and set `verified: true`.
 * Figures below reflect publicly reported conditions of the EKII household
 * programme as of September 2026 and are NOT yet verified.
 */
import type { Localized } from './packages';

export interface SupportItem {
  label: Localized;
  /** Maximum amount in EUR, or null if it cannot be stated as a single figure. */
  maxAmount: number | null;
  condition: Localized;
}

export interface SupportProgramme {
  id: string;
  active: boolean;
  /** Public programme name. */
  name: Localized;
  shortName: string;
  items: SupportItem[];
  maxTotal: number | null;
  /** Public, short eligibility bullets (optional). Leave empty until verified. */
  eligibility: Localized[];
  /** Application deadline, ISO date, or null. */
  deadline: string | null;
  verified: boolean;
  /** Internal verification record — never displayed. */
  internal: {
    administrator: string | null;
    officialSources: { label: string; url: string }[];
    /** Where the amounts/conditions were read, e.g. regulation number and clause. */
    reference: string | null;
    lastVerified: string | null;
    verifiedBy: string | null;
    notes: string;
  };
}

export const supportProgrammes: SupportProgramme[] = [
  {
    id: 'ekii-households',
    active: true,
    shortName: 'EKII',
    name: {
      lv: 'EKII atbalsts mājsaimniecībām atjaunīgās enerģijas ražošanai',
      ru: 'Поддержка EKII для домохозяйств на производство возобновляемой энергии',
      en: 'EKII support for households producing renewable energy',
    },
    items: [
      {
        label: { lv: 'Saules paneļi un invertors', ru: 'Солнечные панели и инвертор', en: 'Solar panels and inverter' },
        maxAmount: 4000,
        condition: { lv: 'Atbalsta apmērs atkarīgs no sistēmas jaudas', ru: 'Размер зависит от мощности системы', en: 'Amount depends on system capacity' },
      },
      {
        label: { lv: 'Akumulators', ru: 'Аккумулятор', en: 'Battery storage' },
        maxAmount: 2500,
        condition: { lv: 'Ietilpība vismaz 5 kWh; arī esošai sistēmai', ru: 'Ёмкость от 5 кВт·ч; также для существующей системы', en: 'Minimum 5 kWh; also for an existing system' },
      },
    ],
    maxTotal: 6500,
    eligibility: [],
    deadline: '2029-12-31',
    verified: false,
    internal: {
      administrator: null, // VERIFY
      officialSources: [
        { label: 'sadalestikls.lv (secondary, to be replaced by the official source)', url: 'https://sadalestikls.lv/lv/valsts-atbalsts-majsaimniecibam-saules-panelu-un-veja-generatoru-uzstadisanai' },
      ],
      reference: null,
      lastVerified: null,
      verifiedBy: null,
      notes: 'Amounts, 5 kWh battery minimum and 2029-12-31 deadline taken from public reporting (Sept 2026). Not yet checked against the regulation.',
    },
  },
];

export const activeProgrammes = () => supportProgrammes.filter((p) => p.active);
export const maxSupportTotal = () => Math.max(0, ...activeProgrammes().map((p) => p.maxTotal ?? 0));
