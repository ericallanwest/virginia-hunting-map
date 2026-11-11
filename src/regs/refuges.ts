/**
 * National Wildlife Refuges (U.S. Fish & Wildlife Service).
 *
 * Refuges are open only where and for what the refuge allows (50 CFR 32.65 for Virginia,
 * plus each refuge's hunt page and brochure), and only within state seasons. Each open
 * refuge needs its own permit, reservation, lottery or check-in. Researched 2026-11-11 from
 * FWS refuge hunt pages and 2026-27 brochures; details in sources/refuges/refuges.json.
 *
 * Boundaries: FWS National Realty Tracts (land FWS owns or leases; easements on private land
 * left out); see sources/refuges/README.md.
 */
import type { Place, Species } from './types';

export interface Refuge {
  url: string;
  /** Species the refuge allows (app species ids); every other species is closed there. */
  species: Species[];
  note: string;
}

const WATERFOWL: Species[] = ['duck', 'goose'];
const FURBEARERS_COMMON: Species[] = ['coyote', 'raccoon', 'opossum', 'fox'];
const SHORE_BIRDS: Species[] = ['rail', 'woodcock', 'dove', 'crow']; // woodcock button includes snipe
const RECACCESS_ESHORE = 'Refuge permit from chincoteague.recaccess.com';

const OPEN: Record<string, Refuge> = {
  'Chincoteague National Wildlife Refuge': {
    url: 'https://www.fws.gov/refuge/chincoteague/visit-us/activities/hunting',
    species: ['deer', 'turkey', ...FURBEARERS_COMMON, ...WATERFOWL, ...SHORE_BIRDS],
    note: `${RECACCESS_ESHORE}; state seasons. Deer includes sika. Turkey needs a refuge quota permit.`,
  },
  'Eastern Shore of Virginia National Wildlife Refuge': {
    url: 'https://www.fws.gov/refuge/eastern-shore-virginia/visit-us/activities/hunting',
    species: ['deer', 'turkey', ...FURBEARERS_COMMON, 'rabbit', 'squirrel', 'quail', ...WATERFOWL, ...SHORE_BIRDS],
    note: `${RECACCESS_ESHORE}; state seasons within Sep 1 – Feb 28. Deer: archery only. Turkey: spring mentor-led hunt only.`,
  },
  'Fisherman Island National Wildlife Refuge': {
    url: 'https://www.fws.gov/refuge/fisherman-island/visit-us/activities/hunting',
    species: [...WATERFOWL, ...SHORE_BIRDS],
    note: `${RECACCESS_ESHORE}; state seasons within Sep 1 – Feb 28. From boats only.`,
  },
  'Wallops Island National Wildlife Refuge': {
    url: 'https://www.fws.gov/refuge/wallops-island/visit-us/activities/hunting',
    species: ['deer', 'turkey', 'rabbit', 'squirrel', ...FURBEARERS_COMMON, ...WATERFOWL, ...SHORE_BIRDS],
    note: `${RECACCESS_ESHORE}; state seasons within Sep 16 – Mar 14. Turkey needs a refuge quota permit.`,
  },
  'Great Dismal Swamp National Wildlife Refuge': {
    url: 'https://www.fws.gov/refuge/great-dismal-swamp/visit-us/activities/hunting',
    species: ['deer', 'bear', 'turkey', 'squirrel', 'coyote'],
    note: 'Refuge hunt permit from greatdismalswamp.recaccess.com. Thursdays, Fridays and Saturdays only, within state seasons.',
  },
  'Elizabeth Hartwell Mason Neck National Wildlife Refuge': {
    url: 'https://www.fws.gov/refuge/elizabeth-hartwell-mason-neck/visit-us/activities/hunting',
    species: ['deer'],
    note: 'Managed deer hunts: date-specific permits from potomacriverrefugehunts.recaccess.com; orientation test and firearm qualification required.',
  },
  'Occoquan Bay National Wildlife Refuge': {
    url: 'https://www.fws.gov/refuge/occoquan-bay/visit-us/activities/hunting',
    species: ['deer', 'fox', 'coyote', 'turkey'],
    note: 'Lottery hunts (potomacriverrefugehunts.recaccess.com); orientation test and firearm qualification required. Turkey: mentor-led hunt only.',
  },
  'Featherstone National Wildlife Refuge': {
    url: 'https://www.fws.gov/refuge/featherstone/visit-us/activities/hunting',
    species: [...WATERFOWL],
    note: 'Waterfowl from boats only, state seasons. No refuge permit required.',
  },
  'James River National Wildlife Refuge': {
    url: 'https://www.fws.gov/refuge/james-river/visit-us/activities/hunting',
    species: ['deer', 'turkey', 'coyote', 'bobcat', 'fox', 'raccoon', 'skunk', 'opossum', 'rabbit', 'groundhog', 'squirrel', ...WATERFOWL],
    note: 'Free daily reservation at jamesrivernwr.recaccess.com (up to 48 h ahead). Spring turkey and winter small game are quota hunts. Waterfowl: mentor-led hunts only.',
  },
  'Presquile National Wildlife Refuge': {
    url: 'https://www.fws.gov/refuge/presquile/visit-us/activities/hunting',
    species: ['deer', 'turkey', 'coyote', 'fox', 'bobcat', 'raccoon', 'skunk', 'squirrel', 'rabbit', 'groundhog', 'opossum'],
    note: 'Quota permit from presquilenwr.recaccess.com. Turkey: fall only.',
  },
  'Plum Tree Island National Wildlife Refuge': {
    url: 'https://www.fws.gov/refuge/plum-tree-island/visit-us/activities/hunting',
    species: [...WATERFOWL],
    note: 'Waterfowl only, from the three designated blinds on the Cow Island unit (first come, first served). The rest of the refuge is a former bombing range: closed.',
  },
  'Mackay Island National Wildlife Refuge': {
    url: 'https://www.fws.gov/refuge/mackay-island/visit-us/activities/hunting',
    species: ['deer', 'coyote', ...WATERFOWL],
    note: 'Signed refuge hunt permit (from the brochure). Deer on set hunt dates; coyote incidental to deer; waterfowl from assigned blinds.',
  },
};

const RAPPAHANNOCK = 'Rappahannock River Valley National Wildlife Refuge';
const RAPPAHANNOCK_OPEN: Refuge = {
  url: 'https://www.fws.gov/refuge/rappahannock-river-valley/visit-us/activities/hunting',
  species: ['deer', 'turkey', 'coyote', 'bobcat', 'squirrel', 'rabbit', 'groundhog', 'fox', 'skunk', 'raccoon', 'opossum', ...WATERFOWL],
  note:
    'Unit permits from rappahannock.recaccess.com; Franklin, Mothershead and Wright need only the free online check-in. ' +
    'Cat Point Creek waterfowl blinds by lottery. Check in and out online.',
};
const RAPPAHANNOCK_CLOSED_UNITS = ['Island Farm', 'Peter', 'Styer/Bishop'];

/** Property name used on the map for a refuge (Rappahannock units are listed separately). */
export const refugeName = (name: string, unit?: string) => (unit ? `${name} — ${unit} Unit` : name);

/** The refuge's hunting program for a place, or undefined if the refuge is closed to hunting. */
export function refugeFor(place: Place): Refuge | undefined {
  if (place.land !== 'refuge' || !place.property) return undefined;
  if (place.property.startsWith(RAPPAHANNOCK)) {
    return RAPPAHANNOCK_CLOSED_UNITS.some((u) => place.property!.endsWith(`— ${u} Unit`)) ? undefined : RAPPAHANNOCK_OPEN;
  }
  return OPEN[place.property];
}

export const REFUGE_NOTE =
  'National Wildlife Refuge: hunting only as the refuge allows, with its permit, reservation or check-in; refuge rules apply within the state seasons shown.';
export const REFUGE_CLOSED_NOTE = 'National Wildlife Refuge: closed to hunting.';
export const refugeSpeciesClosedNote = (s: string) => `National Wildlife Refuge: closed to ${s} hunting.`;
