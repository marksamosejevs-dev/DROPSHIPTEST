/**
 * SOLAR SIZING CALCULATOR — technical assumptions only.
 * ---------------------------------------------------------------------------
 * The calculator estimates system size, annual production, panel count, roof
 * area and battery size. It does NOT calculate prices, savings or payback
 * (AIDEX.lv publishes no prices). Results are indicative; tune the values with
 * AIDEX's engineering team.
 */
export const calculatorAssumptions = {
  /** Annual specific yield in Latvia, kWh per installed kWp (south-facing, ~35°). */
  specificYield: 950,
  /**
   * Average electricity tariff incl. network & VAT, €/kWh. Used ONLY to convert
   * a monthly electricity bill into kWh when the visitor enters a bill amount.
   */
  electricityPrice: 0.2,
  /** Target share of annual consumption covered by production. */
  coverage: 1.0,
  minKw: 3,
  maxKw: 20,
  stepKw: 0.5,
  /** Battery sizes the calculator may recommend, kWh. */
  batterySizes: [5, 10, 16] as number[],
  /** Share of daily consumption that falls outside solar hours. */
  eveningShare: 0.55,
  /** Monthly consumption slider range, kWh. */
  consumptionRange: [150, 2500, 25] as [number, number, number],
  billRange: [30, 500, 5] as [number, number, number],
  defaultConsumption: 600,
  defaultBill: 120,
};
