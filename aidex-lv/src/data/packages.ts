/**
 * ============================================================================
 *  TEMPORARY — REPLACE WITH AIDEX PRODUCT DATA BEFORE PUBLIC LAUNCH
 * ============================================================================
 * The equipment, specifications, warranties, prices and support amounts in
 * this file are a DEVELOPMENT BENCHMARK derived from publicly visible market
 * offers (ENERGUM, energum.lv, September 2026) so that the layout can be
 * reviewed with realistic numbers. They are NOT AIDEX offers and must never
 * be published as AIDEX facts.
 *
 *  - While BENCHMARK_MODE is true, every package card shows a visible
 *    "Demo data" marker and prices are labelled as illustrative.
 *  - To go live: replace the equipment + packages below with AIDEX data,
 *    set `source: 'aidex'` on each entry and BENCHMARK_MODE = false.
 *
 * Nothing else in the codebase contains product or price data; components
 * only render what is defined here.
 * ============================================================================
 */

export const BENCHMARK_MODE = true;

export type Localized = { lv: string; ru: string; en: string };
type Source = 'benchmark' | 'benchmark-approximation' | 'aidex';

export interface PanelModel { id: string; manufacturer: string; model: string; watt: number; type: Localized; source: Source }
export interface InverterModel { id: string; manufacturer: string; model: string; kw: number; phases: 1 | 3; hybrid: boolean; source: Source }
export interface BatteryModel { id: string; manufacturer: string; model: string; kwh: number; source: Source }

// ---- Equipment catalogue (TEMPORARY benchmark) ---------------------------
export const panels: Record<string, PanelModel> = {
  aiko500: {
    id: 'aiko500', manufacturer: 'AIKO', model: '500 W all-black', watt: 500, source: 'benchmark',
    type: { lv: 'Melni monokristāliskie paneļi', ru: 'Чёрные монокристаллические панели', en: 'All-black monocrystalline modules' },
  },
};

export const inverters: Record<string, InverterModel> = {
  gw6: { id: 'gw6', manufacturer: 'Growatt', model: 'Hybrid 6 kW', kw: 6, phases: 3, hybrid: true, source: 'benchmark' },
  gw8: { id: 'gw8', manufacturer: 'Growatt', model: 'Hybrid 8 kW', kw: 8, phases: 3, hybrid: true, source: 'benchmark' },
  gw12: { id: 'gw12', manufacturer: 'Growatt', model: 'Hybrid 12 kW', kw: 12, phases: 3, hybrid: true, source: 'benchmark' },
};

export const batteries: Record<string, BatteryModel> = {
  renon16: { id: 'renon16', manufacturer: 'Renon', model: 'Xcellent Plus 16 kWh', kwh: 16, source: 'benchmark' },
};

// ---- Warranties (TEMPORARY benchmark — confirm AIDEX terms) --------------
export const warranties = {
  panelPowerYears: 30,
  inverterYears: 10,
  batteryYears: 10,
  installationYears: 2,
  source: 'benchmark' as Source,
};

// ---- Packages -------------------------------------------------------------
export interface PackagePricing {
  /** Full project price incl. VAT, before any support. */
  standard: number;
  /** Optional campaign price incl. VAT. */
  promo?: number;
  /** Maximum potential support for the PV part (see src/data/support.ts). */
  supportPv: number;
  /** Maximum potential support for the battery part. */
  supportBattery: number;
}

export interface SolarPackage {
  id: string;
  name: string;
  kw: number | null; // null = custom
  panel: string;
  panelCount: number | null;
  inverter: string | null;
  battery: string | null;
  /** Price of the package WITH battery. */
  withBattery: PackagePricing | null;
  /** Price of the package WITHOUT battery. */
  withoutBattery: PackagePricing | null;
  /** Typical annual consumption the package is sized for (kWh). */
  fitsConsumption: [number, number] | null;
  featured?: boolean;
  /** Key in src/data/media.ts used as the card photograph. */
  image: 'pkg6' | 'pkg8' | 'pkg10' | 'pkgMax';
  source: Source;
  /** e.g. 'energum.lv/komplekti — TURBO 6' */
  benchmarkRef?: string;
}

export const packages: SolarPackage[] = [
  {
    id: 'home-6', name: 'AIDEX Home 6', image: 'pkg6', kw: 6, panel: 'aiko500', panelCount: 12, inverter: 'gw6', battery: 'renon16',
    withBattery: { standard: 9000, supportPv: 2800, supportBattery: 2500 },
    withoutBattery: { standard: 5600, supportPv: 2800, supportBattery: 0 },
    fitsConsumption: [3500, 6500],
    source: 'benchmark', benchmarkRef: 'energum.lv/komplekti — 6 kW kit (price & support); no-battery variant is an approximation',
  },
  {
    id: 'home-8', name: 'AIDEX Home 8', image: 'pkg8', kw: 8, panel: 'aiko500', panelCount: 16, inverter: 'gw8', battery: 'renon16',
    withBattery: { standard: 11500, promo: 10900, supportPv: 3500, supportBattery: 2500 },
    withoutBattery: { standard: 7400, supportPv: 3500, supportBattery: 0 },
    fitsConsumption: [6500, 9000], featured: true,
    source: 'benchmark-approximation', benchmarkRef: 'energum.lv/komplekti — 8 kW kit (support); price approximated',
  },
  {
    id: 'home-10', name: 'AIDEX Home 10', image: 'pkg10', kw: 10, panel: 'aiko500', panelCount: 20, inverter: 'gw12', battery: 'renon16',
    withBattery: { standard: 13300, supportPv: 4000, supportBattery: 2500 },
    withoutBattery: { standard: 9200, supportPv: 4000, supportBattery: 0 },
    fitsConsumption: [9000, 12000],
    source: 'benchmark-approximation', benchmarkRef: 'energum.lv/komplekti — 10 kW kit (support); price approximated',
  },
  {
    id: 'max', name: 'AIDEX Max', image: 'pkgMax', kw: null, panel: 'aiko500', panelCount: null, inverter: null, battery: null,
    withBattery: null, withoutBattery: null, fitsConsumption: [12000, 40000],
    source: 'benchmark',
  },
];

export const netPrice = (p: PackagePricing, includeSupport = true) =>
  (p.promo ?? p.standard) - (includeSupport ? p.supportPv + p.supportBattery : 0);

export const lowestNetPrice = () =>
  Math.min(...packages.flatMap((p) => [p.withBattery, p.withoutBattery]).filter(Boolean).map((p) => netPrice(p!)));
