/**
 * Sunrise/sunset and legal hunting hours.
 *
 * Hunting hours (DWR General Regulations, "Hunting Hours"):
 * - One half-hour before sunrise to one-half hour after sunset for nonmigratory
 *   birds and game animals, except during spring turkey season.
 * - Spring turkey: one half-hour before sunrise until 12 noon, except the last 20
 *   days, when it is one half-hour before sunrise until sunset.
 * - Youth/Apprentice Spring Turkey Weekend: one half-hour before sunrise to sunset.
 * Furbearers (DWR furbearer hunting page): hunting is permitted day or night.
 * Crow is a federally regulated migratory bird; DWR gives no hours for it, so
 * none are claimed.
 *
 * Sun times use the NOAA Solar Calculator algorithm (solar.ts), checked against the U.S.
 * Naval Observatory, which DWR's regulations page links to for sunrise/sunset times.
 */
import { sunEvent } from './solar';
import type { SeasonRule, Species } from './regs/types';

export type Hours = 'half-hour' | 'until-noon' | 'until-sunset' | 'any-time';

const TZ = 'America/New_York';
const FURBEARERS: Species[] = ['bobcat', 'coyote', 'fox', 'raccoon', 'opossum', 'skunk'];

/** Legal hours for a season, or undefined when the regulations don't state them. */
export function hoursFor(rule: SeasonRule): Hours | undefined {
  if (rule.type === 'chase') return undefined; // no take
  if (rule.id === 'turkey-spring-noon') return 'until-noon';
  if (rule.id === 'turkey-spring-allday' || rule.id === 'turkey-youth-spring') return 'until-sunset';
  if (FURBEARERS.includes(rule.species)) return 'any-time';
  if (rule.species === 'crow') return undefined;
  return 'half-hour';
}

export interface SunDay {
  sunrise: Date;
  sunset: Date;
}

/** Sunrise and sunset at a point on a calendar date (ISO, Virginia local date). */
export function sunDay(iso: string, lat: number, lng: number): SunDay {
  const [y, m, d] = iso.split('-').map(Number);
  return { sunrise: sunEvent(true, y, m, d, lat, lng), sunset: sunEvent(false, y, m, d, lat, lng) };
}

const MIN = 60_000;
const round = (d: Date) => new Date(Math.round(d.getTime() / MIN) * MIN);

/** Local noon (12:00 in Virginia) on that date. */
function localNoon(iso: string): Date {
  // Try both offsets; keep the one that formats as 12:00 locally (handles DST).
  for (const off of ['-04:00', '-05:00']) {
    const d = new Date(`${iso}T12:00:00${off}`);
    if (fmtTime(d).startsWith('12:00')) return d;
  }
  return new Date(`${iso}T12:00:00-05:00`);
}

/** Start and end of legal hunting hours, or 'any' for day-or-night species. */
export function legalWindow(hours: Hours, iso: string, sun: SunDay): { start: Date; end: Date } | 'any' {
  if (hours === 'any-time') return 'any';
  const start = round(new Date(sun.sunrise.getTime() - 30 * MIN));
  const end =
    hours === 'until-noon' ? localNoon(iso) : hours === 'until-sunset' ? round(sun.sunset) : round(new Date(sun.sunset.getTime() + 30 * MIN));
  return { start, end };
}

const timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' });
const zoneFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'short' });

export const fmtTime = (d: Date) => timeFmt.format(round(d));
export const zoneName = (d: Date) => zoneFmt.formatToParts(d).find((p) => p.type === 'timeZoneName')?.value ?? '';
