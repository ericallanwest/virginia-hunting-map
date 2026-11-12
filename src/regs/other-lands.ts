/**
 * Other public hunting land (land type 'other_public'): Corps of Engineers land not in DCR's
 * layer, POWRR (Public Opportunities for Wildlife-Related Recreation) and PALS (Public Access
 * Lands for Sportsmen) properties, DWR quota-hunt sites, DCR Natural Area Preserves, and
 * city and county land with hunting programs, and DWR Wildlife Conservation Sites. Researched
 * 2026-11-11 and 2026-11-12; details and sources in
 * sources/lands/*.json and sources/lands/README.md.
 *
 * - 'open': state (private-land) seasons for the county, plus any note (e.g. a permit).
 * - 'check': hunting only by lottery, permit or managed hunt; state seasons shown as "check".
 * - Any 'other_public' property not listed here is closed (e.g. Natural Area Preserves); `species: []`
 *   marks a listed property closed to every species, with its note.
 */
import type { Place, Species } from './types';

export interface OtherLand {
  status: 'open' | 'check';
  /** Species allowed; omitted = every species in season. Others are closed there. */
  species?: Species[];
  note: string;
  url: string;
}

const QUOTA = 'https://dwr.virginia.gov/hunting/quota-hunts/';
const WATERFOWL: Species[] = ['duck', 'goose'];
const POWRR_NOTE = 'POWRR property: open during state seasons with a hunting license (no extra permit). Coyote: Sep 1 – Mar 10 and during spring turkey season.';

export const OTHER_LANDS: Record<string, OtherLand> = {
  'John H. Kerr Reservoir': {
    status: 'open',
    note: 'Army Corps of Engineers land at Kerr Reservoir: private-land seasons for the county apply. Developed recreation areas are closed.',
    url: 'https://dwr.virginia.gov/hunting/regulations/publiclands/',
  },
  'CF Highlands Breaks': { status: 'open', note: POWRR_NOTE, url: 'https://dwr.virginia.gov/place/cf-highlands-breaks/' },
  'CF Highlands Dante': { status: 'open', note: POWRR_NOTE, url: 'https://dwr.virginia.gov/place/cf-highlands-dante/' },
  'CF Highlands Vansant': { status: 'open', note: POWRR_NOTE, url: 'https://dwr.virginia.gov/place/cf-highlands-vansant/' },
  'TNC Big Caney': { status: 'open', note: POWRR_NOTE, url: 'https://dwr.virginia.gov/place/tnc-big-caney/' },
  'CF Highlands Vansant - elk restoration area (no general hunting)': {
    status: 'check',
    species: ['elk'],
    note: 'Elk restoration area: no general hunting; elk only for drawn elk-license hunters.',
    url: 'https://dwr.virginia.gov/powrr/visit-powrr-properties/',
  },
  'TNC Baker - elk restoration area (no general hunting)': {
    status: 'check',
    species: ['elk'],
    note: 'Elk restoration area: no general hunting; elk only for drawn elk-license hunters.',
    url: 'https://dwr.virginia.gov/powrr/visit-powrr-properties/',
  },
  'Coalfields PALS': {
    status: 'open',
    note: 'PALS (Public Access Lands for Sportsmen): state seasons; a PALS permit is required in addition to your license.',
    url: 'https://dwr.virginia.gov/hunting/regulations/publiclands/',
  },
  'James City County PALS (Jolly Pond)': {
    status: 'check',
    species: ['deer'],
    note: 'PALS permit required. Archery and crossbow only; one small parking lot, first come, first served.',
    url: 'https://dwr.virginia.gov/wp-content/uploads/media/James-City-County-PALS-Rules-2026-2027.pdf',
  },
  'New Kent Forestry Center': {
    status: 'check',
    species: ['deer', 'turkey', 'rabbit', 'quail'],
    note: 'DWR quota (lottery) hunts only: apprentice deer and spring gobbler, rabbit and quail. Closed to other hunting.',
    url: QUOTA,
  },
  'Lone Star Lakes Park': {
    status: 'check',
    species: ['deer'],
    note: 'DWR quota (lottery) deer hunts with the City of Suffolk only. Closed to other hunting.',
    url: QUOTA,
  },
  'Dutch Gap Conservation Area (waterfowl blind sites)': {
    status: 'check',
    species: WATERFOWL,
    note: 'DWR quota (lottery) waterfowl hunt from floating blinds at designated stakes only.',
    url: QUOTA,
  },
  'City of Franklin urban archery area (city property)': {
    status: 'check',
    species: ['deer'],
    note: 'Archery only, by city permit (book dates online; staff review each application). Boundary sketched from the city’s map.',
    url: 'https://urban-archery.franklinva.gov/',
  },
  "Crow's Nest Natural Area Preserve": {
    status: 'check',
    species: ['deer', ...WATERFOWL],
    note: 'DCR lottery permit hunts only (deer and waterfowl). Closed otherwise.',
    url: 'https://www.dcr.virginia.gov/natural-heritage/natural-area-preserves/crowsnest',
  },
  'Dameron Marsh Natural Area Preserve': {
    status: 'check',
    species: WATERFOWL,
    note: 'DCR lottery waterfowl hunts only (with Hughlett Point). Closed otherwise.',
    url: 'https://www.dcr.virginia.gov/natural-heritage/natural-area-preserves/dameron',
  },
  'Hughlett Point Natural Area Preserve': {
    status: 'check',
    species: WATERFOWL,
    note: 'DCR lottery waterfowl hunts only (with Dameron Marsh). Closed otherwise.',
    url: 'https://www.dcr.virginia.gov/natural-heritage/natural-area-preserves/hughlett',
  },
  // Inside The Channels State Forest and owned and managed by DOF; DOF's hunting map shows the
  // preserve inside the forest with no closed area marked, but no source says it is open.
  'The Channels Natural Area Preserve': {
    status: 'check',
    note: 'Natural Area Preserve owned and managed by the Department of Forestry inside The Channels State Forest. DOF’s hunting map shows no closure here (State Forest Use Permit and hunting license required; DWR rules for Washington/Russell counties), but neither DOF nor DCR says outright that the preserve is open. Confirm with DOF before hunting the preserve.',
    url: 'https://www.dof.virginia.gov/wp-content/uploads/Channels-SF-Hunting-Map.pdf',
  },
  'Banshee Reeks Nature Preserve': {
    status: 'check',
    species: ['deer'],
    note: 'Loudoun County lottery managed deer hunts only (antlerless only; hunts in October, December and February; lottery Oct 1–31 for December and Dec 1–31 for February; permit and orientation if drawn). Closed to other hunting. Contact BansheeReeks@loudoun.gov.',
    url: 'https://prcsinfo.loudoun.gov/view/1005298707/65/',
  },
  // DWR Wildlife Conservation Sites (WCS) not already in the WMA layer the app uses.
  'Jones Cove WCS (Mockhorn Island WMA)': {
    status: 'check',
    note: 'DWR Wildlife Conservation Site listed with Mockhorn Island WMA; appears to be its mainland GATR Tract (reached by Jones Cove Road): deer archery only, spring turkey by quota, quota-only during muzzleloader season (Mon–Sat), no trapping. Check DWR’s Mockhorn Island page.',
    url: 'https://dwr.virginia.gov/wma/mockhorn-island/',
  },
  'Goochland Marsh WCS (Powhatan WMA Goochland Tract)': {
    status: 'check',
    note: 'DWR Wildlife Conservation Site that DWR’s huntable-lands layer labels "Goochland Tract - Powhatan WMA". DWR publishes no rules for it; check with DWR before hunting.',
    url: 'https://dwr.virginia.gov/wma/powhatan/',
  },
  'Weston Wildlife Conservation Site': {
    status: 'check',
    species: [],
    note: 'DWR Weston Wildlife Conservation Site is a chase-only area (dog training Sept 1 – Mar 31, daylight only); no firearms and no hunting.',
    url: 'https://dwr.virginia.gov/wma/weston/',
  },
};

/** Fairfax County deer management areas (sources/lands/fairfax-deer-program.geojson), by name suffix. */
export const FAIRFAX_ARCHERY: OtherLand = {
  status: 'check',
  species: ['deer'],
  note: 'Fairfax County archery program: approved, qualified archers only (county screening, qualification and assignment). Sept 12, 2026 – Feb 13, 2027, no Sunday hunting in county parks; ends Jan 9, 2027 at Lake Fairfax, Huntley Meadows and Dogue Creek. Closed to other hunting.',
  url: 'https://www.fairfaxcounty.gov/wildlife/archery-program',
};
const FAIRFAX_CLOSED: OtherLand = {
  status: 'check',
  species: [],
  note: 'Fairfax County deer management area with no public hunting (county sharpshooters or no-hunting zone).',
  url: 'https://www.fairfaxcounty.gov/wildlife/archery-program',
};

/** Developed Corps recreation areas at Kerr Reservoir (sources/lands/kerr-recreation-areas.geojson). */
const KERR_RECREATION: OtherLand = {
  status: 'check',
  species: [],
  note: 'Developed Army Corps recreation area at Kerr Reservoir (campground, day-use area, ramp, marina or visitor center): closed to hunting.',
  url: 'https://dwr.virginia.gov/hunting/regulations/publiclands/',
};

function otherLand(property: string): OtherLand | undefined {
  if (OTHER_LANDS[property]) return OTHER_LANDS[property];
  if (property.endsWith('(Kerr Reservoir recreation area)')) return KERR_RECREATION;
  if (property.endsWith('(Fairfax County deer archery program)')) return FAIRFAX_ARCHERY;
  if (property.includes('(Fairfax County deer program:')) return FAIRFAX_CLOSED;
  return undefined;
}

/** The land's program for this species, or undefined if closed to it. */
export function otherLandFor(place: Place, species: Species): OtherLand | undefined {
  if (place.land !== 'other_public' || !place.property) return undefined;
  const land = otherLand(place.property);
  return land && (!land.species || land.species.includes(species)) ? land : undefined;
}

export const otherLandClosedNote = (place: Place, species: Species) => {
  const land = place.property ? otherLand(place.property) : undefined;
  if (!land) {
    return /Natural Area Preserve/.test(place.property ?? '')
      ? 'Natural Area Preserve: closed to hunting.'
      : 'Closed to hunting.';
  }
  return `Closed to ${species} hunting here. ${land.note} ${land.url}`;
};
