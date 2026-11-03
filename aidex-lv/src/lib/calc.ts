/**
 * Indicative solar SIZING model (no prices, savings or payback).
 * Shared by server render and browser.
 */
import { calculatorAssumptions as A } from '../data/calculator';
import { packages, dcKwp } from '../data/packages';
import { panelCatalogue, panelArea } from '../data/equipment';

export interface CalcInput { mode: 'kwh' | 'bill'; value: number; battery: boolean }
export interface CalcResult {
  monthlyKwh: number; annualKwh: number; kw: number; productionKwh: number;
  panels: number; roofM2: number; batteryKwh: number; packageId: string | null;
}

const panel = panelCatalogue[0];
const panelKw = panel.watt / 1000;
const panelM2 = panelArea(panel) ?? 0;

export function calculate(i: CalcInput): CalcResult {
  const monthlyKwh = i.mode === 'bill' ? i.value / A.electricityPrice : i.value;
  const annualKwh = monthlyKwh * 12;
  const rawKw = (annualKwh * A.coverage) / A.specificYield;
  const kw = Math.min(A.maxKw, Math.max(A.minKw, Math.round(rawKw / A.stepKw) * A.stepKw));
  const panels = Math.ceil(kw / panelKw);
  const productionKwh = panels * panelKw * A.specificYield;
  const roofM2 = panels * panelM2;
  const need = (annualKwh / 365) * A.eveningShare;
  const sizes = [...A.batterySizes].sort((a, b) => a - b);
  const batteryKwh = i.battery ? sizes.find((s) => s >= need) ?? sizes[sizes.length - 1] : 0;
  // Matching package: the smallest standard configuration that reaches the recommended kW.
  const std = packages.filter((p) => dcKwp(p) != null).sort((a, b) => dcKwp(a)! - dcKwp(b)!);
  const pkg = std.find((p) => dcKwp(p)! >= kw - 0.25) ?? packages.find((p) => p.kw === null) ?? null;
  return { monthlyKwh, annualKwh, kw, productionKwh, panels, roofM2, batteryKwh, packageId: pkg?.id ?? null };
}
