/**
 * GOVERNMENT SUPPORT PROGRAMMES — editable data source.
 * ---------------------------------------------------------------------------
 * Amounts, conditions and deadlines change. Nothing about support is
 * hard-coded in components: edit this file only.
 *
 * VERIFY every programme against the official administrator before launch and
 * update `lastChecked`. Figures below reflect publicly reported conditions of
 * the EKII household programme as of September 2026 (sources listed).
 */
import type { Localized } from './packages';

export interface SupportProgramme {
  id: string;
  active: boolean;
  name: Localized;
  shortName: string;
  administrator: Localized;
  items: { label: Localized; maxAmount: number | null; condition: Localized }[];
  maxTotal: number | null;
  deadline: string | null; // ISO date
  sources: { label: string; url: string }[];
  lastChecked: string;
  verified: boolean;
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
    administrator: {
      lv: 'Programmas administrētājs — PĀRBAUDĪT pirms publicēšanas',
      ru: 'Администратор программы — ПРОВЕРИТЬ перед публикацией',
      en: 'Programme administrator — VERIFY before launch',
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
    deadline: '2029-12-31',
    sources: [
      { label: 'sadalestikls.lv', url: 'https://sadalestikls.lv/lv/valsts-atbalsts-majsaimniecibam-saules-panelu-un-veja-generatoru-uzstadisanai' },
    ],
    lastChecked: '2026-09-23',
    verified: false,
  },
];

export const maxSupportTotal = () => Math.max(0, ...supportProgrammes.filter((p) => p.active).map((p) => p.maxTotal ?? 0));
