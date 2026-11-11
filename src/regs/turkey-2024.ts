/**
 * Virginia wild turkey regulations, 2024-25 license year (fall 2024 + spring 2025).
 * Source: 2024–2025 Hunting & Trapping in Virginia digest, pp. 46–47
 *   https://dwr.virginia.gov/wp-content/uploads/media/2024-2025-Virginia-Hunting-and-Trapping-Regulations-Digest.pdf
 *   sha256 5174144546ede3b1249c77ba8fff93c0c22600ffaf95aad70d35594924d7bdda
 *
 * Fall seasons are set by county group (either sex; dogs allowed in the fall
 * firearms season). Spring gobbler season is statewide, bearded birds only.
 * Page numbers are the digest's printed page numbers.
 */
import type { DateRange, InfoRule, SeasonRule, SpeciesRegs, Where } from './types';

const SOURCE = 'https://dwr.virginia.gov/wp-content/uploads/media/2024-2025-Virginia-Hunting-and-Trapping-Regulations-Digest.pdf';

let n = 0;
const season = (r: Omit<SeasonRule, 'id' | 'species'> & { id?: string }): SeasonRule => ({
  id: r.id ?? `turkey-${r.type}-${++n}`,
  species: 'turkey',
  ...r,
});

/** Closed fall season (p. 46); fall archery and the fall youth weekend are also closed there. */
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

const OCT: DateRange = ['10-19', '11-01'];
const THANKS: DateRange = ['11-27', '11-28'];
const fall = (where: Where, dates: DateRange[]) =>
  season({
    type: 'firearms',
    label: 'Fall firearms',
    dates,
    where,
    take: 'either-sex',
    dogs: true,
    notes: ['Modern firearms, muzzleloaders, archery, arrowguns. Dogs, decoys and blinds allowed; no electronic calls.'],
    ref: 'fall-firearms-turkey-seasons',
  });

const seasons: SeasonRule[] = [
  season({
    id: 'turkey-archery',
    type: 'archery',
    label: 'Fall archery',
    dates: [['10-05', '11-15']],
    where: OPEN_FALL,
    take: 'either-sex',
    notes: ['Archery tackle only. Decoys and blinds allowed; no dogs except tracking dogs.'],
    ref: 'archery-turkey-season',
  }),
  season({
    id: 'turkey-youth-fall',
    type: 'youth',
    label: 'Youth & Apprentice Fall Turkey Weekend',
    dates: [['10-12', '10-13']],
    where: OPEN_FALL,
    take: 'either-sex',
    youthOnly: true,
    dogs: true,
    notes: ['Bag limit 1 turkey (either sex) per youth/apprentice hunter for the weekend. Hours ½ hour before sunrise to ½ hour after sunset.'],
    ref: 'youth-and-apprentice-fall-turkey-hunting-weekend',
  }),
  fall({ counties: G1 }, [OCT, ['11-28', '11-28']]),
  fall({ counties: G2, cities: ['Hampton', 'Newport News'] }, [OCT, THANKS, ['12-02', '12-28'], ['01-11', '01-25']]),
  fall({ counties: G3, cities: ['Suffolk'] }, [OCT, THANKS, ['12-02', '12-14']]),
  fall({ counties: G4 }, [OCT, THANKS, ['12-02', '12-14'], ['01-11', '01-25']]),

  season({
    id: 'turkey-youth-spring',
    type: 'youth',
    label: 'Youth & Apprentice Spring Turkey Weekend',
    dates: [['04-05', '04-06']],
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
    dates: [['04-12', '04-27']],
    where: { statewide: true },
    take: 'bearded',
    notes: ['Hunting hours ½ hour before sunrise until 12 noon.', 'No dogs, no electronic calls; shot no larger than #2.'],
    ref: 'spring-turkey-season',
  }),
  season({
    id: 'turkey-spring-allday',
    type: 'firearms',
    label: 'Spring gobbler (all day)',
    dates: [['04-28', '05-17']],
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
    '1 turkey per day, 3 per license year (fall + spring combined), no more than 2 of which may be taken in the fall. Fall: either sex. Spring: bearded turkeys only — 1, 2, or 3 depending on how many were taken in the fall.'),
  info('hours-spring', 'hours', { statewide: true }, 'Spring: ½ hour before sunrise until noon Apr 12 – 27; until sunset Apr 28 – May 17.', [['04-05', '05-17']]),
  info('closed-fall', 'access', CLOSED_FALL, 'No fall turkey season here (firearms or archery). The spring season is open statewide.'),
  info('camp-peary', 'local', { counties: ['York'] },
    'Camp Peary has the longer fall season (Dec 2 – 28 and Jan 11 – 25); the rest of York County closes Dec 14.'),
  info('weapons', 'methods', { statewide: true },
    'Fall and spring: modern firearms, muzzleloaders, archery tackle, and arrowguns. Spring: no shot larger than #2.'),
  info('report', 'methods', { statewide: true }, 'All fall and spring turkeys must be reported (phone, app, or online).'),
  info('local-cities-towns', 'local', [{ anyCity: true }, { anyTown: true }],
    'Cities and towns set their own weapon restrictions — check local firearms ordinances.'),
  info('access-nps', 'access', { land: ['nps'] }, 'National Park Service land — hunting is prohibited.'),
  info('access-state-park', 'access', { land: ['state_park'] },
    'Hunting in state parks is limited to designated parks, areas, and dates — check DCR before hunting.'),
];

export const turkey2024: SpeciesRegs = {
  species: 'turkey',
  licenseYear: 2024,
  source: SOURCE,
  seasons,
  eitherSex: [],
  info: infos,
  unlistedPublicPolicy: {
    nps: { status: 'closed', note: 'Hunting is prohibited on National Park Service land.' },
    state_park: { status: 'check', always: true, note: 'Most state parks are closed to hunting or open only for special hunts — check DCR.' },
  },
};

export const TURKEY_2024_GROUPS = { G1, G2, G3, G4 };
