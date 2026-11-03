/**
 * ============================================================================
 *  PACKAGES — technical system configurations (NOT priced offers)
 * ============================================================================
 *  AIDEX.lv does not publish prices. This file therefore contains NO price,
 *  support or commercial data — only the technical configuration of each
 *  package. Customers request an individual quote.
 *
 *  PANELS: SUNPRO POWER SP440-N108M10 Black Frame — chosen and verified by
 *  AIDEX (full manufacturer record in src/data/equipment.ts).
 *  INVERTER / BATTERY: SUNPRO POWER models to be selected; only generic sizes
 *  are shown until verified models are linked via `productId`.
 *  WARRANTIES: not shown until AIDEX confirms its terms (all `null`).
 *
 *  Rules
 *   - Unknown value → `null`. Never guess. A `null` field is simply not shown.
 *   - Components never contain product data; they only render this file.
 *   - Never add prices here: the public site must not display them.
 * ============================================================================
 */

export type Localized = { lv: string; ru: string; en: string };
export type Source = 'benchmark' | 'benchmark-approximation' | 'aidex';

/** `productId` links to the full manufacturer record in src/data/equipment.ts. */
export interface PanelSpec { productId?: string | null; manufacturer: string; model: string | null; watt: number; count: number | null }
/**
 * Inverter / battery in a package. `productId` links to src/data/equipment.ts.
 * While `productId` is null the site shows only the generic size (no brand).
 */
export interface InverterSpec { productId: string | null; manufacturer: string | null; model: string | null; kw: number | null; phases?: 1 | 3 | null; hybrid?: boolean }
export interface BatterySpec { productId: string | null; manufacturer: string | null; model: string | null; kwh: number }

export interface Warranty {
  /** General equipment warranty (inverter, battery…), years. */
  equipmentYears: number | null;
  /** Installation workmanship warranty, years. */
  installationYears: number | null;
  /** Panel product warranty, years. */
  productYears: number | null;
  /** Panel performance (power output) warranty, years. */
  performanceYears: number | null;
  /** Optional free-text detail, e.g. "87.4 % output after 30 years". */
  note?: Localized | null;
}

export interface SolarPackage {
  id: string;
  name: string;
  /** Nominal (commercial) size in kW, used in the package name. `null` = custom project.
   *  The real installed capacity is dcKwp() = panel count × panel W. */
  kw: number | null;
  /** Short description shown on the card (optional). */
  description: Localized | null;
  /** Recommended household profile, e.g. "Family house with a heat pump" (optional). */
  householdProfile: Localized | null;
  /** Typical annual consumption the package is sized for (kWh/year). */
  fitsConsumption: [number, number] | null;
  panel: PanelSpec | null;
  inverter: InverterSpec | null;
  /** Battery in the "with battery" configuration. */
  battery: BatterySpec | null;
  /** `null` = use `defaultWarranty`. */
  warranty: Warranty | null;
  featured?: boolean;
  /** Key in src/data/media.ts used as the card photograph. */
  image: 'pkg6' | 'pkg8' | 'pkg10' | 'pkgMax';
  source: Source;
}

// ---- Shared warranty defaults — AIDEX terms not confirmed yet → not shown --
export const defaultWarranty: Warranty = {
  equipmentYears: null,
  installationYears: null,
  productYears: null,
  performanceYears: null,
  note: null,
};

// Panels: SUNPRO POWER SP440-N108M10 Black Frame (AIDEX choice; full record in src/data/equipment.ts).
// DC capacity = panel count × 440 W → 6.16 / 7.92 / 10.12 kWp.
const sunpro = (count: number): PanelSpec => ({ productId: 'sunpro-sp440-n108m10-bf', manufacturer: 'SUNPRO POWER', model: 'SP440-N108M10', watt: 440, count });
// Inverter and battery: SUNPRO POWER models to be selected (AIDEX uses the SUNPRO ecosystem).
// Until the verified SUNPRO datasheets are entered in src/data/equipment.ts, only the
// generic SIZES are shown (no brand). Set productId when chosen.
const hybridInverter = (kw: number): InverterSpec => ({ productId: null, manufacturer: null, model: null, kw, phases: 3, hybrid: true });
const battery16: BatterySpec = { productId: null, manufacturer: null, model: null, kwh: 16 };

// ---- Packages -------------------------------------------------------------
export const packages: SolarPackage[] = [
  {
    id: 'home-6', name: 'AIDEX Home 6', image: 'pkg6', kw: 6,
    description: null, householdProfile: null,
    fitsConsumption: [3500, 6500],
    panel: sunpro(14), inverter: hybridInverter(6), battery: battery16,
    warranty: null,
    source: 'benchmark',
  },
  {
    id: 'home-8', name: 'AIDEX Home 8', image: 'pkg8', kw: 8, featured: true,
    description: null, householdProfile: null,
    fitsConsumption: [6500, 9000],
    panel: sunpro(18), inverter: hybridInverter(8), battery: battery16,
    warranty: null,
    source: 'benchmark',
  },
  {
    id: 'home-10', name: 'AIDEX Home 10', image: 'pkg10', kw: 10,
    description: null, householdProfile: null,
    fitsConsumption: [9000, 12000],
    panel: sunpro(23), inverter: hybridInverter(12), battery: battery16,
    warranty: null,
    source: 'benchmark',
  },
  {
    id: 'max', name: 'AIDEX Max', image: 'pkgMax', kw: null,
    description: null, householdProfile: null,
    fitsConsumption: [12000, 40000],
    panel: null, inverter: null, battery: null,
    warranty: null,
    source: 'benchmark',
  },
];

// ---- Helpers (used by components; no data below this line) ---------------
export const warrantyOf = (p: SolarPackage): Warranty => p.warranty ?? defaultWarranty;
export const standardPackages = () => packages.filter((p) => p.kw !== null);
/** Real installed DC capacity in kWp (panel count × panel wattage), or null. */
export const dcKwp = (p: SolarPackage) => (p.panel?.count ? (p.panel.count * p.panel.watt) / 1000 : null);

/* ---------------------------------------------------------------------------
 * TEMPLATE — copy for each real AIDEX package
 * ---------------------------------------------------------------------------
  {
    id: 'home-8',                       // URL-safe, stable (used in ?package=)
    name: 'AIDEX Home 8',
    kw: 8,
    description: { lv: '…', ru: '…', en: '…' },          // or null
    householdProfile: { lv: '…', ru: '…', en: '…' },     // or null
    fitsConsumption: [6500, 9000],      // kWh per YEAR
    panel: { productId: '…', manufacturer: '…', model: '…', watt: 0, count: 0 },
    inverter: { productId: '…', manufacturer: 'SUNPRO POWER', model: '…', kw: 0, phases: 3, hybrid: true },
    battery: { productId: '…', manufacturer: 'SUNPRO POWER', model: '…', kwh: 0 },  // or null
    warranty: { equipmentYears: 0, installationYears: 0, productYears: 0, performanceYears: 0, note: null },
    featured: false,
    image: 'pkg8',
    source: 'aidex',
  },
 * ------------------------------------------------------------------------ */
