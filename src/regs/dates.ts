import type { DateRange } from './types';

/**
 * Regulation dates are written 'MM-DD'. The license year runs Jul 1 - Jun 30,
 * so Jul-Dec dates fall in `licenseYear` and Jan-Jun dates in the next year.
 */
export function resolve(mmdd: string, licenseYear: number): string {
  const month = Number(mmdd.slice(0, 2));
  const year = month >= 7 ? licenseYear : licenseYear + 1;
  return `${year}-${mmdd}`;
}

/** License year that contains an ISO date (YYYY-MM-DD). */
export function licenseYearOf(iso: string): number {
  const y = Number(iso.slice(0, 4));
  return Number(iso.slice(5, 7)) >= 7 ? y : y - 1;
}

export function inRanges(iso: string, ranges: DateRange[], licenseYear: number): boolean {
  return ranges.some(([s, e]) => iso >= resolve(s, licenseYear) && iso <= resolve(e, licenseYear));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function fmt(mmdd: string): string {
  return `${MONTHS[Number(mmdd.slice(0, 2)) - 1]} ${Number(mmdd.slice(3))}`;
}

export function fmtRange([s, e]: DateRange): string {
  return s === e ? fmt(s) : `${fmt(s)} – ${fmt(e)}`;
}

export function todayISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Day index within the license year (Jul 1 = 0), for timelines. */
export function dayOfLicenseYear(iso: string): number {
  const ly = licenseYearOf(iso);
  const start = Date.UTC(ly, 6, 1);
  const [y, m, d] = iso.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - start) / 86400000);
}
