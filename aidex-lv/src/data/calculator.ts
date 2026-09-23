/**
 * SOLAR SAVINGS CALCULATOR — assumptions.
 * All results on the site are indicative. Tune these values with AIDEX's
 * engineering team; the calculator UI reads them at build time.
 */
export const calculatorAssumptions = {
  /** Annual specific yield in Latvia, kWh per installed kWp (south-facing, ~35°). */
  specificYield: 950,
  /** All-in retail electricity price incl. network & VAT, €/kWh. */
  electricityPrice: 0.2,
  /** Value of exported surplus electricity, €/kWh. */
  exportPrice: 0.05,
  /** Share of solar production used directly in the home. */
  selfUseWithoutBattery: 0.35,
  selfUseWithBattery: 0.7,
  /** Target share of annual consumption covered by production. */
  coverage: 1.0,
  minKw: 3,
  maxKw: 20,
  stepKw: 0.5,
  /** Available battery sizes, kWh. */
  batterySizes: [5, 10, 16] as number[],
  /** Share of daily consumption that falls outside solar hours. */
  eveningShare: 0.55,
  /** Indicative turnkey price per kWp (PV only), € incl. VAT. */
  pricePerKw: 920,
  /** Indicative fixed cost per project (design, connection, documentation), €. */
  fixedCost: 0,
  /** Indicative battery price per kWh, €. */
  pricePerKwh: 210,
  /** Monthly consumption slider range, kWh. */
  consumptionRange: [150, 2500, 25] as [number, number, number],
  billRange: [30, 500, 5] as [number, number, number],
  defaultConsumption: 600,
  defaultBill: 120,
};
