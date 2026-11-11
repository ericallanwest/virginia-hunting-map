/**
 * Virginia wild turkey regulations, 2025-26 license year (fall 2025 + spring 2026).
 * Source: 2025–2026 Virginia Hunting & Trapping Regulations digest,
 *   https://www.eregulations.com/assets/docs/guides/25VAHD_LR.pdf
 *   sha256 19e03a913e95ac37bef013418087802de23e8726d6c321c82d6c2390b65c7075
 * cross-checked with the eRegulations web copy (sources/regs/2025-26/eregulations/).
 *
 * "p. N" below is the PDF page (the printed page number is N − 2).
 * Fall seasons are set by county group (either sex; dogs allowed in the fall
 * firearms season). Spring gobbler season is statewide, bearded birds only.
 */
import type { DateRange, InfoRule, SeasonRule, SpeciesRegs, Where } from './types';

const SOURCE = 'https://www.eregulations.com/assets/docs/guides/25VAHD_LR.pdf';

let n = 0;
const season = (r: Omit<SeasonRule, 'id' | 'species'> & { id?: string }): SeasonRule => ({
  id: r.id ?? `turkey-${r.type}-${++n}`,
  species: 'turkey',
  ...r,
});

/** Areas with a closed fall firearms season (also closed to fall archery and the fall youth weekend) (p. 48). */
const CLOSED_FALL: Where = { counties: ['Arlington'], cities: ['Chesapeake', 'Norfolk', 'Portsmouth', 'Virginia Beach'] };
const OPEN_FALL: Where = { statewide: true, not: [CLOSED_FALL] };

// Fall firearms groups (p. 48)
const G1 = ['Albemarle', 'Alleghany', 'Augusta', 'Bath', 'Greene', 'Highland', 'Madison', 'Page', 'Rockingham'];
const G2 = [
  'Bedford', 'Bland', 'Botetourt', 'Caroline', 'Carroll', 'Clarke', 'Craig', 'Culpeper', 'Dickenson', 'Essex', 'Fairfax',
  'Fauquier', 'Franklin', 'Giles', 'Grayson', 'King and Queen', 'King George', 'King William', 'Lancaster', 'Lee',
  'Loudoun', 'Montgomery', 'Nelson', 'Northumberland', 'Prince William', 'Pulaski', 'Rappahannock', 'Richmond', 'Roanoke',
  'Rockbridge', 'Russell', 'Scott', 'Smyth', 'Stafford', 'Washington', 'Westmoreland', 'Wise', 'Wythe',
];
const G3 = [
  'Accomack', 'Amelia', 'Dinwiddie', 'Gloucester', 'Greensville', 'Isle of Wight', 'James City', 'Mathews', 'Middlesex',
  'New Kent', 'Northampton', 'Powhatan', 'Prince George', 'Southampton', 'Surry', 'Sussex', 'York',
];
const G4 = [
  'Amherst', 'Appomattox', 'Brunswick', 'Buchanan', 'Buckingham', 'Campbell', 'Charles City', 'Charlotte', 'Chesterfield',
  'Cumberland', 'Floyd', 'Fluvanna', 'Frederick', 'Goochland', 'Halifax', 'Hanover', 'Henrico', 'Henry', 'Louisa',
  'Lunenburg', 'Mecklenburg', 'Nottoway', 'Orange', 'Patrick', 'Pittsylvania', 'Prince Edward', 'Shenandoah',
  'Spotsylvania', 'Tazewell', 'Warren',
];

const OCT: DateRange = ['10-18', '10-31'];
const THANKS: DateRange = ['11-26', '11-27'];
const fall = (where: Where, dates: DateRange[]) =>
  season({
    type: 'firearms',
    label: 'Fall firearms',
    dates,
    where,
    take: 'either-sex',
    dogs: true,
    notes: ['Modern firearms, muzzleloaders, archery, arrowguns. Dogs and decoys allowed; no electronic calls.'],
    ref: 'fall-firearms-turkey-seasons',
  });

const seasons: SeasonRule[] = [
  season({
    id: 'turkey-archery',
    type: 'archery',
    label: 'Fall archery',
    dates: [['10-04', '11-14']],
    where: OPEN_FALL,
    take: 'either-sex',
    notes: ['Archery tackle only. Decoys and blinds allowed; no dogs except tracking dogs.'],
    ref: 'archery-turkey-season',
  }),
  season({
    id: 'turkey-youth-fall',
    type: 'youth',
    label: 'Youth & Apprentice Fall Turkey Weekend',
    dates: [['10-11', '10-12']],
    where: OPEN_FALL,
    take: 'either-sex',
    youthOnly: true,
    dogs: true,
    notes: ['Bag limit 1 turkey for the weekend. Hunting hours ½ hour before sunrise to ½ hour after sunset.'],
    ref: 'youth-and-apprentice-fall-turkey-hunting-weekend',
  }),
  fall({ counties: G1 }, [OCT, ['11-27', '11-27']]),
  // "and on Camp Peary" (York County) is not mapped; the rest of York is in G3 — see the camp-peary fact.
  fall({ counties: G2, cities: ['Hampton', 'Newport News'] }, [OCT, THANKS, ['12-01', '12-27'], ['01-10', '01-24']]),
  fall({ counties: G3, cities: ['Suffolk'] }, [OCT, THANKS, ['12-01', '12-13']]),
  fall({ counties: G4 }, [OCT, THANKS, ['12-01', '12-13'], ['01-10', '01-24']]),

  // Spring (p. 49)
  season({
    id: 'turkey-youth-spring',
    type: 'youth',
    label: 'Youth & Apprentice Spring Turkey Weekend',
    dates: [['04-04', '04-05']],
    where: { statewide: true },
    take: 'bearded',
    youthOnly: true,
    notes: ['1 bearded bird per youth/apprentice hunter for the weekend. Hours ½ hour before sunrise to sunset.'],
    ref: 'youth-and-apprentice-spring-turkey-hunting-weekend',
  }),
  season({
    id: 'turkey-spring-noon',
    type: 'firearms',
    label: 'Spring gobbler (until noon)',
    dates: [['04-11', '04-26']],
    where: { statewide: true },
    take: 'bearded',
    notes: ['Hunting hours ½ hour before sunrise until 12 noon.', 'No dogs, no electronic calls; shot no larger than #2.'],
    ref: 'spring-turkey-season',
  }),
  season({
    id: 'turkey-spring-allday',
    type: 'firearms',
    label: 'Spring gobbler (all day)',
    dates: [['04-27', '05-16']],
    where: { statewide: true },
    take: 'bearded',
    notes: ['Hunting hours ½ hour before sunrise to sunset.', 'No dogs, no electronic calls; shot no larger than #2.'],
    ref: 'spring-turkey-season',
  }),
];

const info = (id: string, topic: InfoRule['topic'], where: InfoRule['where'], text: string, dates?: DateRange[]): InfoRule => ({
  id: `turkey-${id}`,
  species: 'turkey',
  topic,
  where,
  text,
  dates,
});

const infos: InfoRule[] = [
  // p. 48
  info('bag', 'bag', { statewide: true },
    '1 turkey per day, 3 per license year (fall + spring combined), no more than 2 of which may be taken in the fall. Fall: either sex. Spring: bearded turkeys only.'),
  info('hours-spring', 'hours', { statewide: true }, 'Spring: ½ hour before sunrise until noon through Apr 26; until sunset Apr 27 – May 16.', [['04-04', '05-16']]),
  info('closed-fall', 'access', CLOSED_FALL, 'No fall turkey season here (firearms or archery). The spring season is open statewide.'),
  info('camp-peary', 'local', { counties: ['York'] },
    'Camp Peary has the longer fall season (through Dec 27 and Jan 10–24); the rest of York County closes Dec 13.'),
  // Legal Use of Firearms and Archery Tackle (p. 24)
  info('weapons', 'methods', { statewide: true },
    'Turkey may be hunted with shotguns (up to 10 gauge), rifles and pistols of any caliber, muzzleloaders, air guns, and archery tackle. Spring: no shot larger than #2.'),
  info('road', 'methods', { statewide: true }, 'No shooting a firearm, muzzleloader, arrowgun, or bow in, across, or within the right-of-way of any road.'),
  info('report', 'methods', { statewide: true }, 'All fall and spring turkeys must be reported (phone, app, or online).'),
  info('local-cities-towns', 'local', [{ anyCity: true }, { anyTown: true }],
    'Cities and towns set their own weapon restrictions — check local firearms ordinances.'),
  info('access-nps', 'access', { land: ['nps'] }, 'National Park Service land — hunting is prohibited.'),
  info('access-state-park', 'access', { land: ['state_park'] },
    'Hunting in state parks is limited to designated parks, areas, and dates — check DCR before hunting.'),
];

export const turkey2025: SpeciesRegs = {
  species: 'turkey',
  licenseYear: 2025,
  source: SOURCE,
  seasons,
  eitherSex: [],
  info: infos,
  unlistedPublicPolicy: {
    nps: { status: 'closed', note: 'Hunting is prohibited on National Park Service land.' },
    state_park: { status: 'check', always: true, note: 'Most state parks are closed to hunting or open only for special hunts — check DCR.' },
  },
};

export const TURKEY_GROUPS_2025 = { G1, G2, G3, G4 };
