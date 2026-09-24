/**
 * ============================================================================
 *  PACKAGES — the ONLY source of product, price and warranty data on the site
 * ============================================================================
 *  TEMPORARY — REPLACE WITH AIDEX PRODUCT DATA BEFORE PUBLIC LAUNCH
 *
 *  PANELS: SUNPRO POWER SP440-N108M10 Black Frame — chosen and verified by
 *  AIDEX (full manufacturer record in src/data/equipment.ts).
 *  PRICES, SUPPORT, WARRANTIES, INVERTER, BATTERY: still a DEVELOPMENT
 *  BENCHMARK derived from publicly visible market offers (ENERGUM, energum.lv,
 *  September 2026). They are NOT AIDEX offers.
 *
 *  To go live:
 *   1. Fill each package using the template at the bottom of this file.
 *   2. Set `source: 'aidex'` on every package.
 *   3. Set BENCHMARK_MODE = false.
 *
 *  Rules
 *   - Unknown value → `null`. Never guess. A `null` field is simply not shown
 *     (the card / table row hides itself).
 *   - Prices are in EUR incl. VAT.
 *   - `finalPrice` may be left `null`: it is then calculated as
 *     (promoPrice ?? price) − support. If you set it, the build warns when it
 *     does not match that calculation.
 *   - Components never contain product data; they only render this file.
 * ============================================================================
 */

export const BENCHMARK_MODE = true;

export type Localized = { lv: string; ru: string; en: string };
export type Source = 'benchmark' | 'benchmark-approximation' | 'aidex';

/** `productId` links to the full manufacturer record in src/data/equipment.ts. */
export interface PanelSpec { productId?: string | null; manufacturer: string; model: string | null; watt: number; count: number | null }
export interface InverterSpec { manufacturer: string; model: string | null; kw: number | null; phases?: 1 | 3 | null; hybrid?: boolean }
export interface BatterySpec { manufacturer: string; model: string | null; kwh: number }

export interface Offer {
  /** Normal price incl. VAT, before support. */
  price: number;
  /** Campaign price incl. VAT (optional). */
  promoPrice?: number | null;
  /** Maximum potential government support for this configuration. */
  support: number | null;
  /** Split of `support` (optional; used by the calculator's support curve). */
  supportSplit?: { pv: number; battery: number } | null;
  /** Estimated customer price after support. `null` = calculated. */
  finalPrice?: number | null;
}

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
  /** Nominal (commercial) size in kW, used in the name and support curve. `null` = custom project.
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
  /** Battery included in the "with battery" offer. */
  battery: BatterySpec | null;
  offers: { withBattery: Offer | null; withoutBattery: Offer | null };
  /** `null` = use `defaultWarranty`. */
  warranty: Warranty | null;
  featured?: boolean;
  /** Key in src/data/media.ts used as the card photograph. */
  image: 'pkg6' | 'pkg8' | 'pkg10' | 'pkgMax';
  source: Source;
  /** Internal note on where benchmark figures came from. Never rendered. */
  benchmarkRef?: string;
}

// ---- Shared defaults (TEMPORARY benchmark — confirm AIDEX terms) ---------
export const defaultWarranty: Warranty = {
  equipmentYears: 10,
  installationYears: 2,
  productYears: null, // not stated in the benchmark — do not guess
  performanceYears: 30,
  note: null,
};

// Panels: SUNPRO POWER SP440-N108M10 Black Frame (AIDEX choice; full record in src/data/equipment.ts).
// DC capacity = panel count × 440 W → 6.16 / 7.92 / 10.12 kWp.
const sunpro = (count: number): PanelSpec => ({ productId: 'sunpro-sp440-n108m10-bf', manufacturer: 'SUNPRO POWER', model: 'SP440-N108M10', watt: 440, count });
// Inverter and battery: TEMPORARY benchmark equipment, unchanged until AIDEX confirms its choice.
const growatt = (kw: number): InverterSpec => ({ manufacturer: 'Growatt', model: `Hybrid ${kw} kW`, kw, phases: 3, hybrid: true });
const renon16: BatterySpec = { manufacturer: 'Renon', model: 'Xcellent Plus', kwh: 16 };

// ---- Packages -------------------------------------------------------------
export const packages: SolarPackage[] = [
  {
    id: 'home-6', name: 'AIDEX Home 6', image: 'pkg6', kw: 6,
    description: null, householdProfile: null,
    fitsConsumption: [3500, 6500],
    panel: sunpro(14), inverter: growatt(6), battery: renon16,
    offers: {
      withBattery: { price: 9000, support: 5300, supportSplit: { pv: 2800, battery: 2500 } },
      withoutBattery: { price: 5600, support: 2800, supportSplit: { pv: 2800, battery: 0 } },
    },
    warranty: null,
    source: 'benchmark', benchmarkRef: 'energum.lv/komplekti — 6 kW kit (price & support); no-battery variant approximated',
  },
  {
    id: 'home-8', name: 'AIDEX Home 8', image: 'pkg8', kw: 8, featured: true,
    description: null, householdProfile: null,
    fitsConsumption: [6500, 9000],
    panel: sunpro(18), inverter: growatt(8), battery: renon16,
    offers: {
      withBattery: { price: 11500, promoPrice: 10900, support: 6000, supportSplit: { pv: 3500, battery: 2500 } },
      withoutBattery: { price: 7400, support: 3500, supportSplit: { pv: 3500, battery: 0 } },
    },
    warranty: null,
    source: 'benchmark-approximation', benchmarkRef: 'energum.lv/komplekti — 8 kW kit (support); price approximated',
  },
  {
    id: 'home-10', name: 'AIDEX Home 10', image: 'pkg10', kw: 10,
    description: null, householdProfile: null,
    fitsConsumption: [9000, 12000],
    panel: sunpro(23), inverter: growatt(12), battery: renon16,
    offers: {
      withBattery: { price: 13300, support: 6500, supportSplit: { pv: 4000, battery: 2500 } },
      withoutBattery: { price: 9200, support: 4000, supportSplit: { pv: 4000, battery: 0 } },
    },
    warranty: null,
    source: 'benchmark-approximation', benchmarkRef: 'energum.lv/komplekti — 10 kW kit (support); price approximated',
  },
  {
    id: 'max', name: 'AIDEX Max', image: 'pkgMax', kw: null,
    description: null, householdProfile: null,
    fitsConsumption: [12000, 40000],
    panel: null, inverter: null, battery: null,
    offers: { withBattery: null, withoutBattery: null },
    warranty: null,
    source: 'benchmark',
  },
];

// ---- Helpers (used by components; no data below this line) ---------------
export const effectivePrice = (o: Offer) => o.promoPrice ?? o.price;
export const finalPrice = (o: Offer, includeSupport = true) =>
  includeSupport ? o.finalPrice ?? Math.max(0, effectivePrice(o) - (o.support ?? 0)) : effectivePrice(o);
export const warrantyOf = (p: SolarPackage): Warranty => p.warranty ?? defaultWarranty;
export const standardPackages = () => packages.filter((p) => p.kw !== null);
/** Real installed DC capacity in kWp (panel count × panel wattage), or null. */
export const dcKwp = (p: SolarPackage) => (p.panel?.count ? (p.panel.count * p.panel.watt) / 1000 : null);

export const lowestFinalPrice = (variant: 'withBattery' | 'withoutBattery' | 'any' = 'any') =>
  Math.min(...packages
    .flatMap((p) => (variant === 'any' ? [p.offers.withBattery, p.offers.withoutBattery] : [p.offers[variant]]))
    .filter((o): o is Offer => !!o)
    .map((o) => finalPrice(o)));

// Build-time consistency check for manually entered final prices.
for (const p of packages) for (const o of [p.offers.withBattery, p.offers.withoutBattery]) {
  if (o?.finalPrice != null && o.finalPrice !== Math.max(0, effectivePrice(o) - (o.support ?? 0)))
    console.warn(`[packages] ${p.id}: finalPrice ${o.finalPrice} ≠ price − support (${effectivePrice(o) - (o.support ?? 0)})`);
}

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
    inverter: { manufacturer: '…', model: '…', kw: 0, phases: 3, hybrid: true },
    battery: { manufacturer: '…', model: '…', kwh: 0 },  // or null
    offers: {
      withBattery:    { price: 0, promoPrice: null, support: 0, finalPrice: null },
      withoutBattery: { price: 0, promoPrice: null, support: 0, finalPrice: null },
    },
    warranty: { equipmentYears: 0, installationYears: 0, productYears: 0, performanceYears: 0, note: null },
    featured: false,
    image: 'pkg8',
    source: 'aidex',
  },
 * ------------------------------------------------------------------------ */
