/** URLs and localized spec rows for equipment presentation pages. */
import { routes, type Locale } from '../i18n/routes';
import { useT, fmtNum, units, intlLocaleOf } from '../i18n';
import { panelArea, type PanelProduct } from '../data/equipment';

export const equipmentPath = (p: PanelProduct, lang: Locale) => `/${lang}/${routes.solar[lang]}/${p.slug}/`;

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
