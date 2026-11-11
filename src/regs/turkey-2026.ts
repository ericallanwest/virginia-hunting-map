/**
 * Virginia wild turkey regulations, 2026-27 license year (fall 2026 + spring 2027).
 * Source: https://dwr.virginia.gov/hunting/regulations/turkey/ (snapshot in sources/regs/turkey.html)
 *
 * Fall seasons are set by county group (either sex; dogs allowed in the fall
 * firearms season). Spring gobbler season is statewide, bearded birds only.
 */
import type { DateRange, InfoRule, SeasonRule, SpeciesRegs, Where } from './types';

const SOURCE = 'https://dwr.virginia.gov/hunting/regulations/turkey/';

let n = 0;
const season = (r: Omit<SeasonRule, 'id' | 'species'> & { id?: string }): SeasonRule => ({
  id: r.id ?? `turkey-${r.type}-${++n}`,
  species: 'turkey',
  ...r,
});

/** Areas with a closed fall firearms season (also closed to fall archery and the fall youth weekend). */
const CLOSED_FALL: Where = { counties: ['Arlington'], cities: ['Chesapeake', 'Norfolk', 'Portsmouth', 'Virginia Beach'] };
const OPEN_FALL: Where = { statewide: true, not: [CLOSED_FALL] };

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

const OCT: DateRange = ['10-17', '10-30'];
const THANKS: DateRange = ['11-25', '11-26'];
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
    dates: [['10-03', '11-13']],
    where: OPEN_FALL,
    take: 'either-sex',
    notes: ['Archery tackle only. Decoys and blinds allowed; no dogs except tracking dogs.'],
    ref: 'archery-turkey-season',
  }),
  season({
    id: 'turkey-youth-fall',
    type: 'youth',
    label: 'Youth & Apprentice Fall Turkey Weekend',
    dates: [['10-10', '10-11']],
    where: OPEN_FALL,
    take: 'either-sex',
    youthOnly: true,
    dogs: true,
    notes: ['Bag limit 1 turkey for the weekend. Hunting hours ½ hour before sunrise to ½ hour after sunset.'],
    ref: 'youth-and-apprentice-fall-turkey-hunting-weekend',
  }),
  fall({ counties: G1 }, [OCT, ['11-26', '11-26']]),
  fall({ counties: G2, cities: ['Hampton', 'Newport News'] }, [OCT, THANKS, ['11-30', '12-26'], ['01-09', '01-23']]),
  fall({ counties: G3, cities: ['Suffolk'] }, [OCT, THANKS, ['11-30', '12-12']]),
  fall({ counties: G4 }, [OCT, THANKS, ['11-30', '12-12'], ['01-09', '01-23']]),

  season({
    id: 'turkey-youth-spring',
    type: 'youth',
    label: 'Youth & Apprentice Spring Turkey Weekend',
    dates: [['04-03', '04-04']],
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
    dates: [['04-10', '04-25']],
    where: { statewide: true },
    take: 'bearded',
    notes: ['Hunting hours ½ hour before sunrise until 12 noon.', 'No dogs, no electronic calls; shot no larger than #2.'],
    ref: 'spring-turkey-season',
  }),
  season({
    id: 'turkey-spring-allday',
    type: 'firearms',
    label: 'Spring gobbler (all day)',
    dates: [['04-26', '05-15']],
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
  info('bag', 'bag', { statewide: true },
    '1 turkey per day, 3 per license year (fall + spring combined). Only 1 may be beardless, and only in the fall.'),
  info('hours-spring', 'hours', { statewide: true }, 'Spring: ½ hour before sunrise until noon through Apr 25; until sunset Apr 26 – May 15.', [['04-03', '05-15']]),
  info('closed-fall', 'access', CLOSED_FALL, 'No fall turkey season here (firearms or archery). The spring season is open statewide.'),
  info('camp-peary', 'local', { counties: ['York'] },
    'Camp Peary has the longer fall season (through Dec 26 and Jan 9–23); the rest of York County closes Dec 12.'),
  info('report', 'methods', { statewide: true }, 'All fall and spring turkeys must be reported (phone, app, or online).'),
  info('local-cities-towns', 'local', [{ anyCity: true }, { anyTown: true }],
    'Cities and towns set their own weapon restrictions — check local firearms ordinances.'),
  info('access-nps', 'access', { land: ['nps'] }, 'National Park Service land — hunting is prohibited.'),
  info('access-state-park', 'access', { land: ['state_park'] },
    'Hunting in state parks is limited to designated parks, areas, and dates — check DCR before hunting.'),
];

export const turkey2026: SpeciesRegs = {
  species: 'turkey',
  licenseYear: 2026,
  source: SOURCE,
  seasons,
  eitherSex: [],
  info: infos,
  unlistedPublicPolicy: {
    nps: { status: 'closed', note: 'Hunting is prohibited on National Park Service land.' },
    state_park: { status: 'check', always: true, note: 'Most state parks are closed to hunting or open only for special hunts — check DCR.' },
  },
};

export const TURKEY_GROUPS = { G1, G2, G3, G4 };
