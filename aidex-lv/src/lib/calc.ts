/** Indicative solar sizing & savings model. Shared by server render and browser. */
import { calculatorAssumptions as A } from '../data/calculator';
import { packages } from '../data/packages';
import { supportProgrammes } from '../data/support';

export interface CalcInput { mode: 'kwh' | 'bill'; value: number; battery: boolean; support: boolean }
export interface CalcResult {
  monthlyKwh: number; annualKwh: number; kw: number; productionKwh: number; savings: number;
  batteryKwh: number; cost: number; supportAmount: number; net: number; paybackYears: number | null; packageId: string | null;
}

const programme = supportProgrammes.find((p) => p.active);
const pvItemMax = programme?.items[0]?.maxAmount ?? 0;
const batItemMax = programme?.items[1]?.maxAmount ?? 0;
// Support curve for the PV part, derived from package data (kW → amount).
const curve = packages
  .filter((p) => p.kw && p.offers.withoutBattery)
  .map((p) => { const o = p.offers.withoutBattery!; return [p.kw as number, o.supportSplit?.pv ?? o.support ?? 0] as const; })
  .sort((a, b) => a[0] - b[0]);

function pvSupport(kw: number) {
  if (!curve.length) return 0;
  if (kw <= curve[0][0]) return Math.min(pvItemMax, (curve[0][1] / curve[0][0]) * kw);
  for (let i = 1; i < curve.length; i++) {
    const [k0, s0] = curve[i - 1], [k1, s1] = curve[i];
    if (kw <= k1) return Math.min(pvItemMax, s0 + ((s1 - s0) * (kw - k0)) / (k1 - k0));
  }
  return Math.min(pvItemMax, curve[curve.length - 1][1]);
}

export function calculate(i: CalcInput): CalcResult {
  const monthlyKwh = i.mode === 'bill' ? i.value / A.electricityPrice : i.value;
  const annualKwh = monthlyKwh * 12;
  const rawKw = (annualKwh * A.coverage) / A.specificYield;
  const kw = Math.min(A.maxKw, Math.max(A.minKw, Math.round(rawKw / A.stepKw) * A.stepKw));
  const productionKwh = kw * A.specificYield;
  const share = i.battery ? A.selfUseWithBattery : A.selfUseWithoutBattery;
  const self = Math.min(productionKwh * share, annualKwh);
  const exported = Math.max(0, productionKwh - self);
  const savings = self * A.electricityPrice + exported * A.exportPrice;
  const need = (annualKwh / 365) * A.eveningShare;
  const sizes = [...A.batterySizes].sort((a, b) => a - b);
  const batteryKwh = i.battery ? sizes.find((s) => s >= need) ?? sizes[sizes.length - 1] : 0;
  const cost = kw * A.pricePerKw + A.fixedCost + batteryKwh * A.pricePerKwh;
  const supportAmount = i.support ? Math.round(pvSupport(kw) + (batteryKwh >= 5 ? batItemMax : 0)) : 0;
  const net = Math.max(0, cost - supportAmount);
  const paybackYears = savings > 0 ? net / savings : null;
  const pkg = packages.find((p) => p.fitsConsumption && annualKwh >= p.fitsConsumption[0] && annualKwh < p.fitsConsumption[1])
    ?? (annualKwh < (packages[0]?.fitsConsumption?.[0] ?? 0) ? packages[0] : packages[packages.length - 1]);
  return { monthlyKwh, annualKwh, kw, productionKwh, savings, batteryKwh, cost, supportAmount, net, paybackYears, packageId: pkg?.id ?? null };
}
