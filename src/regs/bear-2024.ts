/**
 * Virginia black bear regulations, 2024-25 license year.
 * Source: 2024–2025 Hunting & Trapping in Virginia digest, pp. 28–32
 *   https://dwr.virginia.gov/wp-content/uploads/media/2024-2025-Virginia-Hunting-and-Trapping-Regulations-Digest.pdf
 *   sha256 5174144546ede3b1249c77ba8fff93c0c22600ffaf95aad70d35594924d7bdda
 *
 * In 2024-25 the archery (Oct 5 – Nov 15) and muzzleloader (Nov 9 – 15) bear
 * seasons are statewide; only the firearms seasons are set by county group.
 * Several groups divide counties at I-81 ("northwest"/"southeast"). Montgomery,
 * Pulaski, Smyth and Washington are mapped at I-81; Wythe is not (its mapped
 * line is the bear-hound area), so Wythe rules carry a partialNote.
 * Page numbers are the digest's printed page numbers.
 */
import type { DateRange, DogRule, InfoRule, SeasonRule, SpeciesRegs, Where } from './types';
import { WEST_COUNTIES } from './virginia';

const SOURCE = 'https://dwr.virginia.gov/wp-content/uploads/media/2024-2025-Virginia-Hunting-and-Trapping-Regulations-Digest.pdf';
const CSV = ['Chesapeake', 'Suffolk', 'Virginia Beach'];

let n = 0;
const season = (r: Omit<SeasonRule, 'id' | 'species'> & { id?: string }): SeasonRule => ({
  id: r.id ?? `bear-${r.type}-${++n}`,
  species: 'bear',
  ...r,
});

// Firearms county groups (p. 30) --------------------------------------------
/** Early firearms Sep 30 – Oct 2 (Wythe: northwest of I-81 only, unmapped). */
const EARLY = [
  'Bland', 'Buchanan', 'Craig', 'Dickenson', 'Giles', 'Lee', 'Montgomery/n81', 'Pulaski/n81', 'Roanoke', 'Russell', 'Scott',
  'Smyth/n81', 'Tazewell', 'Washington/n81', 'Wise',
];
/** Firearms Nov 25 – Jan 4 (Wythe northwest of I-81 handled separately). */
const NOV25 = [
  'Albemarle', 'Alleghany', 'Amherst', 'Arlington', 'Augusta', 'Bath', 'Bedford', 'Bland', 'Botetourt', 'Buchanan',
  'Caroline', 'Chesterfield', 'Clarke', 'Craig', 'Culpeper', 'Dickenson', 'Fairfax', 'Fauquier', 'Fluvanna', 'Frederick',
  'Giles', 'Goochland', 'Greene', 'Hanover', 'Henrico', 'Highland', 'Lee', 'Loudoun', 'Louisa', 'Madison', 'Montgomery/n81',
  'Nelson', 'Orange', 'Page', 'Powhatan', 'Prince William', 'Pulaski/n81', 'Rappahannock', 'Roanoke', 'Rockbridge',
  'Rockingham', 'Russell', 'Scott', 'Shenandoah', 'Smyth/n81', 'Spotsylvania', 'Stafford', 'Tazewell', 'Warren',
  'Washington/n81', 'Wise',
];
/** Firearms Dec 2 – Jan 4 (Wythe southeast of I-81 handled separately). */
const DEC2 = [
  'Amelia', 'Appomattox', 'Brunswick', 'Buckingham', 'Campbell', 'Carroll', 'Charles City', 'Charlotte', 'Cumberland',
  'Dinwiddie', 'Essex', 'Floyd', 'Franklin', 'Gloucester', 'Grayson', 'Greensville', 'Halifax', 'Henry', 'Isle of Wight',
  'James City', 'King and Queen', 'King George', 'King William', 'Lancaster', 'Lunenburg', 'Mathews', 'Mecklenburg',
  'Middlesex', 'Montgomery/s81', 'New Kent', 'Northumberland', 'Nottoway', 'Patrick', 'Pittsylvania', 'Prince Edward',
  'Prince George', 'Pulaski/s81', 'Richmond', 'Smyth/s81', 'Southampton', 'Surry', 'Sussex', 'Washington/s81',
  'Westmoreland', 'York',
];
const SHORE = ['Accomack', 'Northampton'];
const NOV25_PROPS = ['Clinch Mountain WMA', 'Hidden Valley WMA', 'The Channels'];

const firearms = (where: Where | Where[], dates: DateRange[], label = 'Firearms', extra: Partial<SeasonRule> = {}) =>
  season({ type: 'firearms', label, dates, where, take: 'any', dogs: true, ref: 'bear-hunting-seasons', ...extra });

const WYTHE_NW = 'Wythe County: only the part northwest of I-81 (I-81 is not mapped as a dividing line in Wythe).';
const WYTHE_SE = 'Wythe County: only the part southeast of I-81 (I-81 is not mapped as a dividing line in Wythe).';

const seasons: SeasonRule[] = [
  season({
    id: 'bear-youth-weekend',
    type: 'youth',
    label: 'Youth & Apprentice Bear Hunting Weekend',
    dates: [['10-12', '10-13']],
    where: { statewide: true },
    take: 'any',
    youthOnly: true,
    dogs: true,
    notes: [
      'Hunters 15 and under, or apprentice license holders, with a licensed adult (who may not carry or discharge a firearm).',
      'Any weapon legal during the firearms season. Dogs allowed on Saturday only, except in the areas listed below.',
      'A bear taken this weekend is the hunter’s bear for the license year.',
    ],
    ref: 'youth-and-apprentice-bear-hunting-weekend',
  }),
  // p. 28: statewide
  season({
    id: 'bear-archery',
    type: 'archery',
    label: 'Archery',
    dates: [['10-05', '11-15']],
    where: { statewide: true },
    take: 'any',
    notes: ['Archery tackle only (no slingbows). No dogs except tracking dogs.'],
    ref: 'archery-bear-season',
  }),
  // p. 29: statewide where muzzleloading rifles are permitted
  season({
    id: 'bear-muzzleloader',
    type: 'muzzleloader',
    label: 'Muzzleloader',
    dates: [['11-09', '11-15']],
    where: { statewide: true },
    take: 'any',
    notes: ['Statewide in all areas where hunting with a muzzleloading rifle is permitted. No dogs except tracking dogs.'],
    ref: 'muzzleloader-bear-season',
  }),

  // p. 30: firearms
  firearms({ counties: EARLY }, [['09-30', '10-02']], 'Early firearms'),
  firearms({ counties: ['Wythe'] }, [['09-30', '10-02']], 'Early firearms', { partialNote: WYTHE_NW }),
  firearms([{ counties: NOV25 }, { properties: NOV25_PROPS }], [['11-25', '01-04']]),
  firearms({ counties: ['Wythe'] }, [['11-25', '01-04']], 'Firearms', { partialNote: WYTHE_NW }),
  firearms({ counties: DEC2, not: [{ properties: NOV25_PROPS }] }, [['12-02', '01-04']]),
  firearms({ counties: ['Wythe'] }, [['12-02', '01-04']], 'Firearms', { partialNote: WYTHE_SE }),
  firearms({ cities: CSV }, [['10-01', '01-04']]),
  // Accomack and Northampton: firearms season closed.

  season({
    id: 'bear-cities-towns',
    type: 'firearms',
    label: 'Any lawful weapon (cities & towns)',
    dates: [['10-05', '01-04']],
    where: [{ anyCity: true, not: [{ cities: CSV }] }, { anyTown: true }],
    take: 'any',
    dogs: true,
    notes: ['Only where the city or town allows bear hunting; local ordinances on hunting and weapons still apply.'],
    ref: 'towns-and-cities',
  }),
];

// Hound training ("chase") seasons (p. 31 maps): no bear may be taken. ----------
const chase = (where: Where | Where[], dates: DateRange[], notes?: string[]) =>
  season({
    type: 'chase',
    label: 'Hound training (no take)',
    dates,
    where,
    take: 'none',
    notes: ['No bear may be taken. No weapons capable of taking a bear. 4 a.m.–10 p.m., including Sundays.', ...(notes ?? [])],
    ref: 'bear-hound-trainingchase-seasons',
  });
seasons.push(
  chase(
    [
      {
        counties: [
          'Albemarle', 'Alleghany', 'Amherst', 'Augusta', 'Bath', 'Bedford', 'Bland', 'Botetourt', 'Brunswick', 'Buchanan',
          'Carroll', 'Charlotte', 'Craig', 'Culpeper', 'Dickenson', 'Floyd', 'Franklin', 'Giles', 'Greene', 'Greensville',
          'Highland', 'Lee', 'Lunenburg', 'Madison', 'Mecklenburg', 'Montgomery', 'Nelson', 'Page', 'Pulaski', 'Rappahannock',
          'Rockbridge', 'Rockingham', 'Russell', 'Scott', 'Shenandoah', 'Tazewell', 'Warren', 'Wise', 'Wythe',
          // Parts of counties (map, p. 31): north of I-81 / east of State Rt. 16
          'Grayson/e16', 'Roanoke/n81', 'Washington/n81', 'Smyth/n81', 'Smyth/e16',
        ],
      },
      { cities: CSV, not: [{ properties: ['Cavalier WMA'] }] },
    ],
    [['08-01', '09-28']],
  ),
  chase({ properties: ['Cavalier WMA'] }, [['08-10', '08-24']]),
  chase(
    {
      counties: [
        'Amelia', 'Appomattox', 'Brunswick', 'Buckingham', 'Campbell/east', 'Charles City', 'Charlotte', 'Cumberland',
        'Dinwiddie', 'Essex', 'Gloucester', 'Greensville', 'Halifax', 'Isle of Wight', 'James City', 'King and Queen',
        'King George', 'King William', 'Lancaster', 'Lunenburg', 'Mathews', 'Mecklenburg', 'Middlesex', 'New Kent',
        'Northumberland', 'Nottoway', 'Pittsylvania/east', 'Prince Edward', 'Prince George', 'Richmond', 'Southampton',
        'Surry', 'Sussex', 'Westmoreland', 'York',
      ],
    },
    [['11-16', '11-30']],
  ),
);

// Dogs (p. 31) ----------------------------------------------------------------
const NO_DOG_WMAS = [
  'Amelia WMA', 'C.F. Phelps WMA', 'Doe Creek WMA', 'Featherfin WMA', 'Thompson WMA', 'Mattaponi WMA',
  'Mattaponi Bluffs WMA', 'Merrimac Farm WMA', 'Oakley Forest WMA', 'Flippo-Gentry WMA', 'Pettigrew WMA',
  'Robert W. Duncan WMA', 'Tye River WMA', 'Ware Creek WMA',
];

const dogRules: DogRule[] = [
  {
    where: { counties: [...WEST_COUNTIES, 'Amherst/west', 'Bedford', 'Nelson/west'] },
    dates: [['11-25', '12-01']],
    note: 'No hounds Nov 25 – Dec 1 west of the Blue Ridge (and in Bedford, Amherst west of Rt. 29, Nelson west of Rt. 151).',
  },
  { where: { counties: ['Madison', 'Greene'] }, dates: [['11-25', '11-29']], note: 'No hounds Nov 25–29 in Madison and Greene.' },
  {
    where: [
      { counties: ['Fairfax', 'Floyd', 'Franklin', 'Henry', 'Loudoun', 'Patrick', 'Campbell/west', 'Pittsylvania/west'] },
      { cities: ['Lynchburg'] },
    ],
    seasonTypes: ['firearms'],
    note: 'Dogs may not be used during the firearms bear season here.',
  },
  {
    where: { counties: ['Carroll/enr', 'Grayson/enr', 'Montgomery/s81', 'Pulaski/s81', 'Roanoke/s81', 'Wythe/senr'] },
    seasonTypes: ['firearms'],
    note: 'Dogs may not be used during the firearms bear season in this part of the county.',
  },
  { where: { properties: NO_DOG_WMAS }, note: 'Dogs may not be used to hunt bears on this WMA.' },
  { where: { properties: ['Cavalier WMA'] }, note: 'Dogs may only be used here during the Aug 10–24 hound training season.' },
  // Youth & apprentice weekend (Saturday): exceptions to the dog allowance (p. 28)
  {
    where: [
      { counties: ['Accomack', 'Fairfax', 'Henry', 'Loudoun', 'Northampton', 'Patrick', 'Campbell/west', 'Pittsylvania/west'] },
      { cities: ['Lynchburg'] },
    ],
    seasonTypes: ['youth'],
    note: 'No dogs here on the youth & apprentice weekend.',
  },
  {
    where: { counties: ['Grayson/w16', 'Roanoke/s81', 'Washington/s81', 'Smyth/s81+w16'] },
    seasonTypes: ['youth'],
    note: 'No dogs in this part of the county on the youth & apprentice weekend.',
  },
];

// Facts --------------------------------------------------------------------
const info = (id: string, topic: InfoRule['topic'], where: InfoRule['where'], text: string, dates?: DateRange[]): InfoRule => ({
  id: `bear-${id}`,
  species: 'bear',
  topic,
  where,
  text,
  dates,
});

const infos: InfoRule[] = [
  info('bag', 'bag', { statewide: true },
    '1 bear per license year, at least 100 lb live (75 lb dressed). Females with cubs may not be taken — cubs often lag behind the sow.'),
  info('shore-closed', 'access', { counties: SHORE }, 'No firearms bear season in Accomack and Northampton (archery and muzzleloader seasons are statewide).'),
  info('bait', 'methods', { statewide: true }, 'Feeding or baiting bears is illegal year-round, statewide.'),
  info('report', 'methods', { statewide: true }, 'Report your harvest (Go Outdoors Virginia app, website, or phone) and submit a premolar tooth.'),
  info('mange', 'methods', { statewide: true },
    'Avoid harvesting bears showing signs of mange. A harvested mangy bear must still be tagged and reported; email bearmange@dwr.virginia.gov for a possible replacement tag. A mangy bear may not be killed during training (chase) seasons.'),
  info('weapons', 'methods', { statewide: true },
    'Archery tackle with 7/8-inch broadheads (no slingbows); muzzleloading rifles .40 caliber or larger during the muzzleloader season; any firearm legal for bear during firearms seasons.'),
  info('dogs-sunday', 'dogs', { statewide: true }, 'No hunting bears with dogs on Sundays while in possession of a weapon.'),
  info('dogs-archery', 'dogs', { statewide: true }, 'No dogs (other than tracking dogs) during archery or muzzleloader seasons.'),
  info('local-cities-towns', 'local', [{ anyCity: true }, { anyTown: true }],
    'Cities and towns set their own hunting and weapon restrictions — check local ordinances.'),
  info('access-nps', 'access', { land: ['nps'] }, 'National Park Service land — hunting is prohibited.'),
  info('access-state-park', 'access', { land: ['state_park'] },
    'Hunting in state parks is limited to designated parks, areas, and dates — check DCR before hunting.'),
];

export const bear2024: SpeciesRegs = {
  species: 'bear',
  licenseYear: 2024,
  source: SOURCE,
  seasons,
  eitherSex: [],
  info: infos,
  dogRules,
  noDogsOnSunday: true,
  unlistedPublicPolicy: {
    nps: { status: 'closed', note: 'Hunting is prohibited on National Park Service land.' },
    state_park: { status: 'check', always: true, note: 'Most state parks are closed to hunting or open only for special hunts — check DCR.' },
  },
};

/** Firearms county groups, exported for coverage tests. */
export const BEAR_2024_GROUPS = { EARLY, NOV25, DEC2, SHORE };
