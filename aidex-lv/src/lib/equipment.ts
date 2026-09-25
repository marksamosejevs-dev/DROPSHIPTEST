/** URLs and localized spec rows for equipment presentation pages. */
import { routes, type Locale } from '../i18n/routes';
import { useT, fmtNum, units, intlLocaleOf } from '../i18n';
import { panelArea, type PanelProduct, type InverterProduct, type BatteryProduct, type AnyProduct } from '../data/equipment';

/** Panels and inverters live under the solar section, batteries under the batteries section. */
export const equipmentSection = (p: AnyProduct) => (p.kind === 'battery' ? 'batteries' : 'solar') as 'batteries' | 'solar';
export const equipmentPath = (p: AnyProduct, lang: Locale) => `/${lang}/${routes[equipmentSection(p)][lang]}/${p.slug}/`;

type Row = { k: string; v: string };
const row = (ok: unknown, k: string, v: () => string): Row | null => (ok !== null && ok !== undefined && ok !== false && ok !== '' ? { k, v: v() } : null);

/** Spec groups for the equipment page. Rows with unknown (null) values are omitted. */
export function panelSpecGroups(p: PanelProduct, lang: Locale) {
  const e = useT(lang).equipment;
  const L = e.labels;
  const u = units[lang];
  const n = (x: number, d = 0) => fmtNum(x, lang, d);
  const keep = (list: (Row | null)[]) => list.filter((r): r is Row => r !== null);
  const area = panelArea(p);
  return [
    { title: e.groups.general, rows: keep([
      row(p.manufacturer, L.manufacturer, () => p.manufacturer),
      row(p.model, L.model, () => p.model),
      row(p.series, L.series, () => p.series),
      row(p.technology, L.technology, () => p.technology),
      row(p.cellCount, L.cellCount, () => `${p.cellCount} ${e.halfCells}`),
      row(p.cellType, L.cells, () => p.cellType![lang]),
      row(p.bifacial, L.bifacial, () => (p.bifacial ? e.yes : e.no)),
    ]) },
    { title: e.groups.electrical, rows: keep([
      row(p.watt, L.power, () => `${n(p.watt)} ${u.w}`),
      row(p.powerRange, L.powerRange, () => `${n(p.powerRange![0])}–${n(p.powerRange![1])} ${u.w}`),
      row(p.efficiency, L.efficiency, () => `${n(p.efficiency!, 2)} %`),
      row(p.maxSystemVoltage, L.maxVoltage, () => p.maxSystemVoltage!),
      row(p.maxSeriesFuseA, L.fuse, () => `${n(p.maxSeriesFuseA!)} A`),
      row(p.tempCoeffPmax, L.tempPmax, () => p.tempCoeffPmax!),
    ]) },
    { title: e.groups.mechanical, rows: keep([
      row(p.construction, L.construction, () => e.construction[p.construction!]),
      row(p.glass, L.glass, () => p.glass![lang]),
      row(p.frameColour, L.frame, () => p.frameColour![lang]),
      row(p.dimensions, L.dimensions, () => `${p.dimensions!.map((d) => n(d)).join(' × ')} ${lang === 'ru' ? 'мм' : 'mm'}`),
      row(area, L.area, () => `${n(area!, 2)} ${lang === 'ru' ? 'м²' : 'm²'}`),
      row(p.weightKg, L.weight, () => `${n(p.weightKg!, 1)} ${lang === 'ru' ? 'кг' : 'kg'}`),
      row(p.connector, L.connector, () => p.connector![lang]),
      row(p.snowLoadPa, L.snow, () => `${n(p.snowLoadPa!)} Pa`),
      row(p.windLoadPa, L.wind, () => `${n(p.windLoadPa!)} Pa`),
    ]) },
    { title: e.groups.warranty, rows: keep([
      row(p.productWarrantyYears, L.productWarranty, () => e.years(p.productWarrantyYears!)),
      row(p.performanceWarrantyYears, L.performanceWarranty, () => e.years(p.performanceWarrantyYears!)),
      row(p.outputYear25, L.output25, () => `≥ ${n(p.outputYear25!, 1)} %`),
      row(p.outputYear30, L.output30, () => `≥ ${n(p.outputYear30!, 1)} %`),
      row(p.certifications.length || null, L.certifications, () => p.certifications.join(', ')),
    ]) },
  ].filter((g) => g.rows.length > 0);
}

/** STC / NMOT electrical table rows (null if no data). */
export function panelElectrical(p: PanelProduct, lang: Locale) {
  if (!p.stc && !p.nmot) return null;
  const n = (x: number | undefined, d: number) => (x === undefined ? '—' : new Intl.NumberFormat(intlLocaleOf(lang), { minimumFractionDigits: d, maximumFractionDigits: d }).format(x));
  const U = lang === 'ru' ? { W: 'Вт', V: 'В', A: 'А' } : { W: 'W', V: 'V', A: 'A' };
  const keys = [['pmax', 'Pmax', 'W', 0], ['vmp', 'Vmp', 'V', 2], ['imp', 'Imp', 'A', 2], ['voc', 'Voc', 'V', 2], ['isc', 'Isc', 'A', 2]] as const;
  return keys.map(([k, label, unit, d]) => ({ label: `${label} (${U[unit]})`, stc: n(p.stc?.[k], d), nmot: n(p.nmot?.[k], d) }));
}

/** Inverter spec groups (rows with null values omitted). */
export function inverterSpecGroups(p: InverterProduct, lang: Locale) {
  const e = useT(lang).equipment;
  const L = e.inv;
  const n = (x: number, d = 0) => fmtNum(x, lang, d);
  const keep = (list: (Row | null)[]) => list.filter((r): r is Row => r !== null);
  return [
    { title: e.groups.general, rows: keep([
      row(p.manufacturer, e.labels.manufacturer, () => p.manufacturer),
      row(p.model, e.labels.model, () => p.model),
      row(p.series, e.labels.series, () => p.series!),
      row(p.type, L.type, () => L.types[p.type]),
      row(p.phases, L.phases, () => String(p.phases)),
    ]) },
    { title: L.dc, rows: keep([
      row(p.maxPvInputKw, L.maxPv, () => `${n(p.maxPvInputKw!, 1)} kW`),
      row(p.mpptCount, L.mppt, () => `${p.mpptCount}${p.stringsPerMppt ? ` × ${p.stringsPerMppt}` : ''}`),
      row(p.mpptVoltageRange, L.mpptRange, () => p.mpptVoltageRange!),
      row(p.maxDcVoltage, L.maxDc, () => p.maxDcVoltage!),
      row(p.maxInputCurrentPerMppt, L.maxCurrent, () => p.maxInputCurrentPerMppt!),
    ]) },
    { title: L.ac, rows: keep([
      row(p.ratedAcKw, L.ratedAc, () => `${n(p.ratedAcKw, 1)} kW`),
      row(p.maxAcKva, L.maxAc, () => `${n(p.maxAcKva!, 1)} kVA`),
      row(p.backupEps, L.backup, () => p.backupEps![lang]),
      row(p.maxEfficiency, L.maxEff, () => `${n(p.maxEfficiency!, 1)} %`),
      row(p.euroEfficiency, L.euroEff, () => `${n(p.euroEfficiency!, 1)} %`),
    ]) },
    { title: L.battery, rows: keep([
      row(p.batteryVoltage, L.batteryType, () => L.voltage[p.batteryVoltage!]),
      row(p.batteryVoltageRange, L.batteryRange, () => p.batteryVoltageRange!),
      row(p.maxChargeDischargeKw, L.chargePower, () => `${n(p.maxChargeDischargeKw!, 1)} kW`),
    ]) },
    { title: e.groups.mechanical, rows: keep([
      row(p.ipRating, L.ip, () => p.ipRating!),
      row(p.dimensions, e.labels.dimensions, () => `${p.dimensions!.map((d) => n(d)).join(' × ')} mm`),
      row(p.weightKg, e.labels.weight, () => `${n(p.weightKg!, 1)} kg`),
      row(p.monitoring, L.monitoring, () => p.monitoring![lang]),
      row(p.productWarrantyYears, e.labels.productWarranty, () => e.years(p.productWarrantyYears!)),
      row(p.gridCodes.length || null, L.gridCodes, () => p.gridCodes.join(', ')),
    ]) },
  ].filter((g) => g.rows.length > 0);
}

/** Battery spec groups (rows with null values omitted). */
export function batterySpecGroups(p: BatteryProduct, lang: Locale) {
  const e = useT(lang).equipment;
  const L = e.bat;
  const n = (x: number, d = 0) => fmtNum(x, lang, d);
  const keep = (list: (Row | null)[]) => list.filter((r): r is Row => r !== null);
  return [
    { title: e.groups.general, rows: keep([
      row(p.manufacturer, e.labels.manufacturer, () => p.manufacturer),
      row(p.model, e.labels.model, () => p.model),
      row(p.series, e.labels.series, () => p.series!),
      row(p.chemistry, L.chemistry, () => p.chemistry!),
      row(p.voltageClass, L.voltageClass, () => e.inv.voltage[p.voltageClass!]),
    ]) },
    { title: L.capacity, rows: keep([
      row(p.moduleKwh, L.module, () => `${n(p.moduleKwh!, 2)} kWh`),
      row(p.usableKwh, L.usable, () => `${n(p.usableKwh!, 2)} kWh`),
      row(p.capacities.length || null, L.capacities, () => p.capacities.map((c) => n(c, 1)).join(' / ') + ' kWh'),
      row(p.nominalVoltage, L.voltage, () => p.nominalVoltage!),
      row(p.maxChargeDischargeKw, L.power, () => `${n(p.maxChargeDischargeKw!, 1)} kW`),
      row(p.depthOfDischarge, L.dod, () => `${n(p.depthOfDischarge!)} %`),
      row(p.cycleLife, L.cycles, () => p.cycleLife!),
    ]) },
    { title: e.groups.mechanical, rows: keep([
      row(p.installation, L.installation, () => p.installation![lang]),
      row(p.ipRating, e.inv.ip, () => p.ipRating!),
      row(p.operatingTemp, L.temp, () => p.operatingTemp!),
      row(p.dimensions, e.labels.dimensions, () => `${p.dimensions!.map((d) => n(d)).join(' × ')} mm`),
      row(p.weightKg, e.labels.weight, () => `${n(p.weightKg!, 1)} kg`),
    ]) },
    { title: e.groups.warranty, rows: keep([
      row(p.productWarrantyYears, e.labels.productWarranty, () => e.years(p.productWarrantyYears!)),
      row(p.warrantyThroughput, L.throughput, () => p.warrantyThroughput!),
      row(p.certifications.length || null, e.labels.certifications, () => p.certifications.join(', ')),
    ]) },
  ].filter((g) => g.rows.length > 0);
}

export function specGroups(p: AnyProduct, lang: Locale) {
  return p.kind === 'panel' ? panelSpecGroups(p, lang) : p.kind === 'inverter' ? inverterSpecGroups(p, lang) : batterySpecGroups(p, lang);
}
