/**
 * EQUIPMENT CATALOGUE — manufacturer data for components used in AIDEX packages.
 * ---------------------------------------------------------------------------
 * Every product here gets its own presentation page
 *   /lv/saules-paneli/<slug>/  ·  /ru/solnechnye-paneli/<slug>/  ·  /en/solar-panels/<slug>/
 * and is referenced from src/data/packages.ts by `id`.
 *
 * RULES
 *  - Values come ONLY from the manufacturer's official product information.
 *    Unknown → null (null values are not shown anywhere).
 *  - `verification` records the source. It is never rendered.
 *  - Benefit copy (`benefits`) is AIDEX's own wording; each line names the
 *    spec it is based on (`basis`). Do not add claims the data does not support.
 */
import type { Localized } from './packages';
import type { MediaKey } from './media';

export interface ElectricalPoint { pmax: number; vmp: number; imp: number; voc: number; isc: number }

export interface PanelProduct {
  id: string;
  slug: string;
  kind: 'panel';
  manufacturer: string;
  manufacturerUrl: string;
  /** Exact model of the power class used in AIDEX packages. */
  model: string;
  /** Model family / series as named by the manufacturer. */
  series: string;
  variant: Localized;
  technology: string;
  cellType: Localized | null;
  cellCount: number | null;
  /** Rated power (W, STC) of the model used in packages. */
  watt: number;
  /** Power classes available in the series (W). */
  powerRange: [number, number] | null;
  /** Module efficiency of `watt` at STC, %. */
  efficiency: number | null;
  bifacial: boolean | null;
  construction: 'double-glass' | 'glass-backsheet' | null;
  glass: Localized | null;
  frameColour: Localized | null;
  /** L × W × H, mm. */
  dimensions: [number, number, number] | null;
  weightKg: number | null;
  maxSystemVoltage: string | null;
  maxSeriesFuseA: number | null;
  connector: Localized | null;
  tempCoeffPmax: string | null;
  snowLoadPa: number | null;
  windLoadPa: number | null;
  /** Electrical data of the model used in packages. */
  stc: ElectricalPoint | null;
  nmot: ElectricalPoint | null;
  /** Warranty values stay null until confirmed separately. */
  productWarrantyYears: number | null;
  performanceWarrantyYears: number | null;
  outputYear25: number | null;
  outputYear30: number | null;
  certifications: string[];
  /** Official manufacturer product page or datasheet. */
  referenceUrl: string;
  /** true if referenceUrl is a downloadable datasheet (PDF). */
  referenceIsDatasheet: boolean;
  /** Product photos (media keys). Empty = page uses a neutral illustration. */
  photos: MediaKey[];
  /** AIDEX-written customer benefits, each backed by a spec value. */
  benefits: { title: Localized; text: Localized; basis: string }[];
  /** Internal verification record — never rendered. */
  verification: { verified: boolean; verifiedBy: string; checkedOn: string; sources: { label: string; url: string }[]; notes: string };
}

export const sunproSp440: PanelProduct = {
  id: 'sunpro-sp440-n108m10-bf',
  slug: 'sunpro-power-sp440-n108m10',
  kind: 'panel',
  manufacturer: 'SUNPRO POWER',
  manufacturerUrl: 'https://www.sunpropower.com/',
  model: 'SP440-N108M10',
  series: 'SPxxx-N108M10 Black Frame (410–440 W)',
  variant: { lv: 'Melns rāmis (Black Frame)', ru: 'Чёрная рама (Black Frame)', en: 'Black Frame' },
  technology: 'N-type TOPCon',
  cellType: { lv: 'N tipa monokristāliskās, 182 × 91 mm', ru: 'Монокристаллические N-типа, 182 × 91 мм', en: 'N-type monocrystalline, 182 × 91 mm' },
  cellCount: 108,
  watt: 440,
  powerRange: [410, 440],
  efficiency: 22.53,
  bifacial: null,
  construction: null,
  glass: {
    lv: '3,2 mm īpaši caurspīdīgs, reljefs, rūdīts stikls ar pārklājumu',
    ru: 'Сверхпрозрачное рифлёное закалённое стекло 3,2 мм с покрытием',
    en: '3.2 mm ultra-clear embossed tempered coated glass',
  },
  frameColour: { lv: 'Melns', ru: 'Чёрная', en: 'Black' },
  dimensions: [1722, 1134, 30],
  weightKg: 21,
  maxSystemVoltage: 'DC 1500 V (TÜV)',
  maxSeriesFuseA: 25,
  connector: { lv: 'MC4 saderīgs, IP68', ru: 'Совместимый с MC4, IP68', en: 'MC4-compatible, IP68' },
  tempCoeffPmax: null,
  snowLoadPa: null,
  windLoadPa: null,
  stc: { pmax: 440, vmp: 32.09, imp: 13.72, voc: 38.53, isc: 14.43 },
  nmot: { pmax: 329, vmp: 29.9, imp: 11.0, voc: 36.1, isc: 11.63 },
  productWarrantyYears: null,
  performanceWarrantyYears: null,
  outputYear25: null,
  outputYear30: null,
  certifications: [],
  referenceUrl: 'https://www.sunpropower.com/product/topcon/spxxxn108m10-410440w-black-frame.html',
  referenceIsDatasheet: false,
  photos: [],
  benefits: [
    {
      basis: 'technology, cellType',
      title: { lv: 'N-type TOPCon tehnoloģija', ru: 'Технология N-type TOPCon', en: 'N-type TOPCon technology' },
      text: {
        lv: 'Mūsdienīgas N tipa monokristāliskās TOPCon šūnas — 108 pusšūnas vienā modulī.',
        ru: 'Современные монокристаллические ячейки N-типа TOPCon — 108 полуячеек в модуле.',
        en: 'Modern N-type monocrystalline TOPCon cells — 108 half-cells per module.',
      },
    },
    {
      basis: 'efficiency',
      title: { lv: 'Līdz 22,53 % moduļa efektivitāte', ru: 'КПД модуля до 22,53 %', en: 'Up to 22.53% module efficiency' },
      text: {
        lv: '440 W versijas efektivitāte ir 22,53 % — vairāk jaudas no katra jumta kvadrātmetra.',
        ru: 'КПД версии 440 Вт — 22,53 %: больше мощности с каждого квадратного метра крыши.',
        en: 'The 440 W version reaches 22.53% efficiency — more power from every square metre of roof.',
      },
    },
    {
      basis: 'dimensions, weightKg',
      title: { lv: 'Kompakts formāts privātmājai', ru: 'Компактный формат для частного дома', en: 'Compact residential format' },
      text: {
        lv: '1722 × 1134 mm un 21 kg — izmērs, kas ērti izvietojams uz privātmāju jumtiem.',
        ru: '1722 × 1134 мм и 21 кг — размер, который удобно размещать на крышах частных домов.',
        en: '1722 × 1134 mm and 21 kg — a size that fits residential roofs well.',
      },
    },
    {
      basis: 'frameColour',
      title: { lv: 'Melns rāmis', ru: 'Чёрная рама', en: 'Black frame' },
      text: {
        lv: 'Melns rāmis — tīrs, vienmērīgs izskats uz jumta.',
        ru: 'Чёрная рама — аккуратный, однородный вид на крыше.',
        en: 'A black frame for a clean, even look on the roof.',
      },
    },
    {
      basis: 'connector',
      title: { lv: 'IP68 savienotāji', ru: 'Разъёмы IP68', en: 'IP68 connectors' },
      text: {
        lv: 'MC4 saderīgi savienotāji ar IP68 aizsardzības klasi pret putekļiem un ūdeni.',
        ru: 'Разъёмы, совместимые с MC4, с классом защиты IP68 от пыли и воды.',
        en: 'MC4-compatible connectors rated IP68 against dust and water.',
      },
    },
    {
      basis: 'series (residential rooftop)',
      title: { lv: 'Paredzēts jumta sistēmām', ru: 'Для крышных систем', en: 'Made for rooftop systems' },
      text: {
        lv: 'Modulis paredzēts privātmāju jumta saules sistēmām.',
        ru: 'Модуль предназначен для солнечных систем на крышах частных домов.',
        en: 'The module is designed for residential rooftop solar systems.',
      },
    },
  ],
  verification: {
    verified: true,
    verifiedBy: 'AIDEX (client), from the official SUNPRO product information',
    checkedOn: '2026-09-24',
    sources: [{ label: 'SUNPRO SPxxx-N108M10 (410–440W) Black Frame — official product page', url: 'https://www.sunpropower.com/product/topcon/spxxxn108m10-410440w-black-frame.html' }],
    notes: 'Only the values supplied by AIDEX are filled. Warranty, loads, temperature coefficients, bifaciality, construction and certifications stay null until confirmed.',
  },
};

export const panelCatalogue: PanelProduct[] = [sunproSp440];
export const panelById = (id: string) => panelCatalogue.find((p) => p.id === id) ?? null;
/** Module area in m² (null if dimensions unknown). */
export const panelArea = (p: PanelProduct) => (p.dimensions ? (p.dimensions[0] * p.dimensions[1]) / 1e6 : null);
