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
 * Boundaries: DoD MIRTA installation layer (FY2020), checked against Census TIGER; see
 * sources/military/README.md.
 */
import type { Place } from './types';

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

export const MILITARY_PROGRAM_NOTE =
  'Military installation: hunting only with an installation permit (register on its iSportsman site); ' +
  'the base’s seasons, hunting days, areas and bag limits apply. Dates shown are the state framework.';
export const MILITARY_CLOSED_NOTE = 'Military installation: no public hunting.';
