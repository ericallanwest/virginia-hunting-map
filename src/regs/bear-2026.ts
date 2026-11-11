/**
 * Virginia black bear regulations, 2026-27 license year.
 * Source: https://dwr.virginia.gov/hunting/regulations/bear/ (snapshot in sources/regs/bear.html)
 *
 * Bear seasons are set by county group and apply to all land in the county
 * (except where noted). The main extra dimension is hunting with hounds:
 * firearms seasons allow dogs unless a DogRule (or Sunday) prohibits them.
 */
import type { DateRange, DogRule, InfoRule, SeasonRule, SpeciesRegs, Where } from './types';
import { WEST_COUNTIES } from './virginia';

const SOURCE = 'https://dwr.virginia.gov/hunting/regulations/bear/';
const CSV = ['Chesapeake', 'Suffolk', 'Virginia Beach'];

let n = 0;
const season = (r: Omit<SeasonRule, 'id' | 'species'> & { id?: string }): SeasonRule => ({
  id: r.id ?? `bear-${r.type}-${++n}`,
  species: 'bear',
  ...r,
});

// County groups ------------------------------------------------------------
const SW = ['Buchanan', 'Dickenson', 'Lee', 'Russell', 'Scott', 'Washington', 'Wise'];
const B = [
  'Arlington', 'Bland', 'Caroline', 'Charlotte', 'Chesterfield', 'Craig', 'Fairfax', 'Fluvanna', 'Giles', 'Goochland',
  'Halifax', 'Hanover', 'Henrico', 'Louisa', 'Mecklenburg', 'Montgomery', 'Orange', 'Powhatan', 'Prince Edward',
  'Prince William', 'Pulaski', 'Roanoke', 'Smyth', 'Spotsylvania', 'Stafford', 'Tazewell', 'Wythe',
];
const BLUE_RIDGE = [
  'Albemarle', 'Alleghany', 'Amherst', 'Appomattox', 'Augusta', 'Bath', 'Bedford', 'Botetourt', 'Buckingham', 'Clarke',
  'Culpeper', 'Fauquier', 'Frederick', 'Greene', 'Highland', 'Loudoun', 'Madison', 'Nelson', 'Page', 'Rappahannock',
  'Rockbridge', 'Rockingham', 'Shenandoah', 'Warren',
];
const EAST = [
  'Amelia', 'Brunswick', 'Campbell', 'Carroll', 'Charles City', 'Cumberland', 'Dinwiddie', 'Essex', 'Floyd', 'Franklin',
  'Gloucester', 'Grayson', 'Greensville', 'Henry', 'Isle of Wight', 'James City', 'King and Queen', 'King George',
  'King William', 'Lancaster', 'Lunenburg', 'Mathews', 'Middlesex', 'New Kent', 'Northumberland', 'Nottoway', 'Patrick',
  'Pittsylvania', 'Prince George', 'Richmond', 'Southampton', 'Surry', 'Sussex', 'Westmoreland', 'York',
];
const SHORE = ['Accomack', 'Northampton'];

const archery = (counties: string[] | Where, dates: DateRange) =>
  season({
    type: 'archery',
    label: 'Archery',
    dates: [dates],
    where: Array.isArray(counties) ? { counties } : counties,
    take: 'any',
    notes: ['Archery tackle only (no slingbows). No dogs except tracking dogs.'],
    ref: 'archery-bear-season',
  });
const muzz = (counties: string[], dates: DateRange) =>
  season({
    type: 'muzzleloader',
    label: 'Muzzleloader',
    dates: [dates],
    where: { counties },
    take: 'any',
    notes: ['Muzzleloading guns only. No dogs except tracking dogs.'],
    ref: 'muzzleloader-bear-season',
  });
const firearms = (where: Where | Where[], dates: DateRange[], label = 'Firearms', notes?: string[]) =>
  season({ type: 'firearms', label, dates, where, take: 'any', dogs: true, notes, ref: 'bear-hunting-seasons' });

const seasons: SeasonRule[] = [
  season({
    id: 'bear-youth-weekend',
    type: 'youth',
    label: 'Youth & Apprentice Bear Hunting Weekend',
    dates: [['10-10', '10-11']],
    where: { statewide: true },
    take: 'any',
    youthOnly: true,
    dogs: true,
    notes: [
      'Hunters 15 and under, or apprentice license holders, with a licensed adult (who may not use a firearm).',
      'Any weapon legal during the firearms season. Dogs allowed on Saturday only, except in the areas listed below.',
      'A bear taken this weekend is the hunter’s bear for the license year.',
    ],
    ref: 'youth-and-apprentice-bear-hunting-weekend',
  }),

  // Southwest
  firearms({ counties: SW, not: [{ properties: ['Clinch Mountain WMA'] }] }, [['09-28', '09-30']], 'Early firearms'),
  archery(SW, ['10-03', '11-13']),
  muzz(SW, ['11-07', '11-13']),
  firearms({ counties: SW }, [['11-23', '01-02']]),

  // Central / southwest piedmont & NOVA
  archery(B, ['10-03', '11-13']),
  muzz(B, ['11-07', '11-13']),
  firearms({ counties: B }, [['11-23', '01-02']]),

  // Blue Ridge & Shenandoah Valley
  archery(BLUE_RIDGE, ['10-17', '11-13']),
  muzz(BLUE_RIDGE, ['11-10', '11-13']),
  firearms({ counties: BLUE_RIDGE }, [['11-27', '11-29'], ['12-21', '01-02']]),

  // Southside & Tidewater
  archery(EAST, ['10-03', '11-13']),
  muzz(EAST, ['11-07', '11-13']),
  firearms({ counties: EAST }, [['11-30', '01-02']]),

  // Chesapeake, Suffolk, Virginia Beach
  archery({ cities: CSV }, ['10-03', '11-13']),
  firearms({ cities: CSV }, [['10-01', '01-02']]),

  // Eastern Shore: no firearms season
  archery(SHORE, ['10-03', '11-13']),
  muzz(SHORE, ['11-07', '11-13']),

  // Cities and towns that allow bear hunting
  season({
    id: 'bear-cities-towns',
    type: 'firearms',
    label: 'Any lawful weapon (cities & towns)',
    dates: [['10-03', '01-02']],
    where: [{ anyCity: true, not: [{ cities: CSV }] }, { anyTown: true }],
    take: 'any',
    dogs: true,
    notes: ['Only where the city or town allows bear hunting; local ordinances on hunting and weapons still apply.'],
    ref: 'towns-and-cities',
  }),
];

// Hound training ("chase") seasons: dogs may pursue bears; no bear may be taken.
const chase = (where: Where | Where[], dates: DateRange[], notes?: string[], partialNote?: string) =>
  season({
    type: 'chase',
    label: 'Hound training (no take)',
    dates,
    where,
    take: 'none',
    partialNote,
    notes: ['No bear may be taken. No weapons capable of taking a bear. 4 a.m.–10 p.m.', ...(notes ?? [])],
    ref: 'bear-hound-trainingchase-seasons',
  });
const EXCL_SUN = ['Nov 30 – Dec 19 excludes Sundays.'];
seasons.push(
  chase(
    {
      counties: [
        'Albemarle', 'Alleghany', 'Amherst', 'Augusta', 'Bath', 'Bedford', 'Botetourt', 'Culpeper', 'Greene', 'Highland',
        'Madison', 'Nelson', 'Page', 'Rappahannock', 'Rockbridge', 'Rockingham', 'Shenandoah', 'Warren',
      ],
    },
    [['08-01', '09-26'], ['11-30', '12-19']],
    EXCL_SUN,
  ),
  chase({ counties: ['Brunswick', 'Greensville', 'Lunenburg'] }, [['08-01', '09-26'], ['11-14', '11-28']]),
  chase({ counties: ['Charlotte', 'Mecklenburg'] }, [['08-01', '09-26'], ['11-14', '11-22']]),
  chase({ counties: ['Halifax', 'Prince Edward'] }, [['11-14', '11-22']]),
  chase(
    [
      {
        counties: [
          'Bland', 'Buchanan', 'Carroll', 'Craig', 'Dickenson', 'Franklin', 'Floyd', 'Giles', 'Lee', 'Montgomery', 'Pulaski',
          'Russell', 'Scott', 'Tazewell', 'Wise', 'Wythe',
        ],
      },
      { cities: CSV, not: [{ properties: ['Cavalier WMA'] }] },
    ],
    [['08-01', '09-26']],
  ),
  // Parts of counties (lines mapped in scripts/split-jurisdictions.py)
  chase({ counties: ['Grayson/e16', 'Roanoke/n81', 'Washington/n81', 'Smyth/e16+n81'] }, [['08-01', '09-26']]),
  chase({ properties: ['Cavalier WMA'] }, [['08-08', '08-22']]),
  chase(
    {
      counties: [
        'Amelia', 'Campbell/east', 'Charles City', 'Cumberland', 'Dinwiddie', 'Essex', 'Gloucester', 'Isle of Wight',
        'James City', 'King and Queen', 'King George', 'King William', 'Lancaster', 'Mathews', 'Middlesex', 'New Kent',
        'Northumberland', 'Nottoway', 'Pittsylvania/east', 'Prince George', 'Richmond', 'Southampton', 'Surry', 'Sussex',
        'Westmoreland', 'York',
      ],
    },
    [['11-14', '11-28']],
  ),
  chase({ counties: ['Appomattox', 'Buckingham'] }, [['11-14', '11-26'], ['11-30', '12-19']], EXCL_SUN),
  chase({ counties: ['Clarke', 'Fauquier', 'Frederick'] }, [['11-30', '12-19']], EXCL_SUN),
);

// Dogs ----------------------------------------------------------------------
const NO_DOG_WMAS = [
  'Amelia WMA', 'C.F. Phelps WMA', 'Doe Creek WMA', 'Featherfin WMA', 'Thompson WMA', 'Mattaponi WMA',
  'Mattaponi Bluffs WMA', 'Merrimac Farm WMA', 'Oakley Forest WMA', 'Flippo-Gentry WMA', 'Pettigrew WMA',
  'Robert W. Duncan WMA', 'Tye River WMA', 'Ware Creek WMA',
];

const dogRules: DogRule[] = [
  {
    where: { counties: [...WEST_COUNTIES, 'Amherst/west', 'Bedford', 'Nelson/west'] },
    dates: [['11-23', '11-29']],
    note: 'No hounds Nov 23–29 west of the Blue Ridge (and in Bedford, Amherst west of Rt. 29, Nelson west of Rt. 151).',
  },
  { where: { counties: ['Madison', 'Greene'] }, dates: [['11-23', '11-27']], note: 'No hounds Nov 23–27 in Madison and Greene.' },
  {
    where: [
      { counties: ['Fairfax', 'Floyd', 'Franklin', 'Henry', 'Loudoun', 'Patrick', 'Campbell/west', 'Pittsylvania/west'] },
      { cities: ['Lynchburg'] },
    ],
    seasonTypes: ['firearms'],
    note: 'Dogs may not be used during the firearms bear season here.',
  },
  {
    // Parts of counties (lines mapped in scripts/split-jurisdictions.py)
    where: { counties: ['Carroll/enr', 'Grayson/enr', 'Montgomery/s81', 'Pulaski/s81', 'Roanoke/s81', 'Wythe/senr'] },
    seasonTypes: ['firearms'],
    note: 'Dogs may not be used during the firearms bear season in this part of the county.',
  },
  { where: { properties: NO_DOG_WMAS }, note: 'Dogs may not be used to hunt bears on this WMA.' },
  { where: { properties: ['Cavalier WMA'] }, note: 'Dogs may only be used here during the Aug 8–22 hound training season.' },
  // Youth & apprentice weekend (Saturday): exceptions to the dog allowance
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
  info('bait', 'methods', { statewide: true }, 'Feeding or baiting bears is illegal year-round, statewide.'),
  info('report', 'methods', { statewide: true }, 'Report your harvest (Go Outdoors Virginia app, website, or phone) and submit a tooth.'),
  info('mange', 'methods', { statewide: true },
    'Avoid harvesting bears showing signs of mange. A harvested mangy bear must still be tagged and reported; email bearmange@dwr.virginia.gov for a possible replacement tag.'),
  info('dogs-sunday', 'dogs', { statewide: true }, 'No hunting bears with dogs on Sundays, and no bear hunting within 200 yards of a place of worship on Sundays.'),
  info('dogs-archery', 'dogs', { statewide: true }, 'No dogs (other than tracking dogs on a lead) during archery or muzzleloader seasons.'),
  info('local-cities-towns', 'local', [{ anyCity: true }, { anyTown: true }],
    'Cities and towns set their own hunting and weapon restrictions — check local ordinances.'),
  info('access-nps', 'access', { land: ['nps'] }, 'National Park Service land — hunting is prohibited.'),
  info('access-state-park', 'access', { land: ['state_park'] },
    'Hunting in state parks is limited to designated parks, areas, and dates — check DCR before hunting.'),
];

export const bear2026: SpeciesRegs = {
  species: 'bear',
  licenseYear: 2026,
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

/** County groups, exported for coverage tests. */
export const BEAR_GROUPS = { SW, B, BLUE_RIDGE, EAST, SHORE };
