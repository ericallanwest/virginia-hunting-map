/**
 * Military (Department of Defense) installations.
 *
 * State seasons don't open military land on their own. DWR's public lands page ("Military
 * Areas", https://dwr.virginia.gov/hunting/regulations/publiclands/, checked 2026-11-11):
 * "Fort A.P. Hill, Fort Pickett, Fort Belvoir, Joint Base Langley-Eustis (Fort Eustis only)
 * and Marine Corps Base Quantico provide hunting opportunities." Each needs base access, an
 * installation permit through its iSportsman site, and daily check-in, plus all Virginia
 * licenses; the base's own seasons, days, areas and bag limits apply within the state's.
 * Other DoD land has no public hunting.
 *
 * Where a base's own seasons for a license year are encoded (military-2026.ts), those replace
 * the state framework for that species on the base.
 *
 * Boundaries: DoD MIRTA installation layer (FY2020), checked against Census TIGER; see
 * sources/military/README.md.
 */
import { MILITARY_2026, type BaseYear } from './military-2026';
import { draftMode } from './draft';
import type { Place, SeasonRule, Species } from './types';
// DRAFT-BASE-IMPORTS (managed by scripts/new-license-year.mjs)

export interface Installation {
  url: string;
  note: string;
}

/** Installations with public hunting programs, by name as in public-lands (land 'military'). */
export const HUNTING_PROGRAMS: Record<string, Installation> = {
  'Marine Corps Base Quantico': {
    url: 'https://quantico.isportsman.net/',
    note:
      'Deer: Quantico does not take part in extended deer seasons (urban archery, early/late antlerless, ' +
      'NOVA late archery). Its firearms deer season is buck-only except designated either-sex days. ' +
      'Sunday hunting allowed; no hunting Tuesdays or Wednesdays.',
  },
  'Fort A.P. Hill (formerly Fort Walker)': {
    url: 'https://walker.isportsman.net/',
    note: 'No Sunday hunting. Deer bag limits and either-sex days are set by the installation. No deer dogs.',
  },
  'Fort Pickett (formerly Fort Barfoot)': {
    url: 'https://ftpickett.isportsman.net/',
    note: 'No hunting on Sundays or Mondays. No deer dogs. Apprentice licenses are not honored.',
  },
  'Fort Belvoir': {
    url: 'https://ftbelvoir.isportsman.net/',
    note: 'Archery only. No dogs or drives. Earn a Buck applies.',
  },
  'Joint Base Langley-Eustis - Fort Eustis': {
    url: 'https://jble.isportsman.net/',
    note: 'Fort Eustis only (not Langley).',
  },
};

export const militaryProgram = (place: Place): Installation | undefined =>
  place.land === 'military' && place.property ? HUNTING_PROGRAMS[place.property] : undefined;

/**
 * Bases' own seasons for a license year being drafted (shown only with ?draft=1);
 * scripts/new-license-year.mjs adds entries here. Move them to BASE_REGS to publish.
 */
const DRAFT_BASES: BaseYear[] = [
  // DRAFT-BASE-ENTRIES
];

/**
 * Bases' own seasons, by license year (military-<year>.ts). Add a year's file here; a year
 * with no entry for a base (e.g. an archived year) falls back to the state framework.
 */
export const BASE_REGS: BaseYear[] = [...MILITARY_2026, ...(draftMode ? DRAFT_BASES : [])];

/** The base's own regulations for a program base and license year, if encoded. */
export const baseYear = (place: Place, licenseYear: number): BaseYear | undefined =>
  militaryProgram(place)
    ? BASE_REGS.find((b) => b.installation === place.property && b.licenseYear === licenseYear)
    : undefined;

/**
 * The base's own seasons for a species, or undefined to fall back to the state framework.
 * A species the base closes gets an empty list.
 */
export function baseSeasons(place: Place, species: Species, licenseYear: number): { year: BaseYear; rules: SeasonRule[] } | undefined {
  const year = baseYear(place, licenseYear);
  if (!year) return undefined;
  if (year.closed?.includes(species)) return { year, rules: [] };
  const rules = year.seasons.filter((s) => s.species === species);
  return rules.length ? { year, rules } : undefined;
}

/** Note on each season taken from a base's regulation. */
export const baseSeasonNote = (year: BaseYear) =>
  `Base season from ${year.source}. Installation permit and iSportsman check-in required.`;

export const MILITARY_PROGRAM_NOTE =
  'Military installation: hunting only with an installation permit (register on its iSportsman site); ' +
  'the base’s seasons, hunting days, areas and bag limits apply. Dates shown are the state framework.';
export const MILITARY_CLOSED_NOTE = 'Military installation: no public hunting.';
