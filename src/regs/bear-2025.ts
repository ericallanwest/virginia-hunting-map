/**
 * Virginia black bear regulations, 2025-26 license year (Jul 1 2025 - Jun 30 2026).
 * Source: 2025–2026 Virginia Hunting & Trapping Regulations digest,
 *   https://www.eregulations.com/assets/docs/guides/25VAHD_LR.pdf
 *   sha256 19e03a913e95ac37bef013418087802de23e8726d6c321c82d6c2390b65c7075
 * cross-checked with the eRegulations web copy (sources/regs/2025-26/eregulations/).
 *
 * "p. N" below is the PDF page (the printed page number is N − 2).
 * Bear seasons are set by county group and apply to all land in the county
 * (except where noted). Firearms seasons allow dogs unless a DogRule (or Sunday) prohibits them.
 */
import type { DateRange, DogRule, InfoRule, SeasonRule, SpeciesRegs, Where } from './types';
import { WEST_COUNTIES } from './virginia';

const SOURCE = 'https://www.eregulations.com/assets/docs/guides/25VAHD_LR.pdf';
const CSV = ['Chesapeake', 'Suffolk', 'Virginia Beach'];

let n = 0;
const season = (r: Omit<SeasonRule, 'id' | 'species'> & { id?: string }): SeasonRule => ({
  id: r.id ?? `bear-${r.type}-${++n}`,
  species: 'bear',
  ...r,
});

// County groups (p. 30) -------------------------------------------------------
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
/** Closed season in 2025-26 (no archery, muzzleloader, or firearms season). */
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
  // p. 28
  season({
    id: 'bear-youth-weekend',
    type: 'youth',
    label: 'Youth & Apprentice Bear Hunting Weekend',
    dates: [['10-11', '10-12']],
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

  // Southwest (p. 30)
  firearms({ counties: SW }, [['09-29', '10-01']], 'Early firearms'),
  archery(SW, ['10-04', '11-14']),
  muzz(SW, ['11-08', '11-14']),
  firearms({ counties: SW }, [['11-24', '01-03']]),

  // Central / southwest piedmont & NOVA
  archery(B, ['10-04', '11-14']),
  muzz(B, ['11-08', '11-14']),
  firearms({ counties: B }, [['11-24', '01-03']]),

  // Blue Ridge & Shenandoah Valley
  archery(BLUE_RIDGE, ['10-18', '11-14']),
  muzz(BLUE_RIDGE, ['11-11', '11-14']),
  firearms({ counties: BLUE_RIDGE }, [['11-28', '11-30'], ['12-22', '01-03']]),

  // Southside & Tidewater
  archery(EAST, ['10-04', '11-14']),
  muzz(EAST, ['11-08', '11-14']),
  firearms({ counties: EAST }, [['12-01', '01-03']]),

  // Chesapeake, Suffolk, Virginia Beach
  archery({ cities: CSV }, ['10-04', '11-14']),
  firearms({ cities: CSV }, [['10-01', '01-03']]),

  // Accomack and Northampton: closed season (p. 30).

  // Cities and towns that allow bear hunting (p. 30)
  season({
    id: 'bear-cities-towns',
    type: 'firearms',
    label: 'Any lawful weapon (cities & towns)',
    dates: [['10-04', '01-03']],
    where: [{ anyCity: true, not: [{ cities: CSV }] }, { anyTown: true }],
    take: 'any',
    dogs: true,
    notes: ['Only where the city or town allows bear hunting; local ordinances on hunting and weapons still apply.'],
    ref: 'towns-and-cities',
  }),
];

// Hound training ("chase") seasons (p. 31): dogs may pursue bears; no bear may be taken.
const chase = (where: Where | Where[], dates: DateRange[], notes?: string[], weekdays?: number[]) =>
  season({
    type: 'chase',
    label: weekdays ? 'Hound training (no take; not Sundays)' : 'Hound training (no take)',
    dates,
    where,
    take: 'none',
    weekdays,
    notes: ['No bear may be taken. No weapons capable of taking a bear. 4 a.m.–10 p.m.', ...(notes ?? [])],
    ref: 'bear-hound-trainingchase-seasons',
  });
const MON_SAT = [1, 2, 3, 4, 5, 6];
const DEC_NO_SUN: DateRange = ['12-01', '12-20'];
const BLUE_RIDGE_CHASE = [
  'Albemarle', 'Alleghany', 'Amherst', 'Augusta', 'Bath', 'Bedford', 'Botetourt', 'Culpeper', 'Greene', 'Highland',
  'Madison', 'Nelson', 'Page', 'Rappahannock', 'Rockbridge', 'Rockingham', 'Shenandoah', 'Warren',
];
seasons.push(
  chase({ counties: BLUE_RIDGE_CHASE }, [['08-01', '09-27']]),
  chase({ counties: BLUE_RIDGE_CHASE }, [DEC_NO_SUN], ['Dec 1 – 20 excludes Sundays.'], MON_SAT),
  chase({ counties: ['Brunswick', 'Greensville', 'Lunenburg'] }, [['08-01', '09-27'], ['11-15', '11-29']]),
  chase({ counties: ['Charlotte', 'Mecklenburg'] }, [['08-01', '09-27'], ['11-15', '11-23']]),
  chase({ counties: ['Halifax', 'Prince Edward'] }, [['11-15', '11-23']]),
  chase(
    [
      {
        counties: [
          'Bland', 'Buchanan', 'Carroll', 'Craig', 'Dickenson', 'Franklin', 'Floyd', 'Giles', 'Lee', 'Montgomery', 'Pulaski',
          'Russell', 'Scott', 'Tazewell', 'Wise', 'Wythe',
        ],
        not: [{ properties: ['Cavalier WMA'] }],
      },
      { cities: CSV, not: [{ properties: ['Cavalier WMA'] }] },
    ],
    [['08-01', '09-27']],
  ),
  // Parts of counties (lines mapped in scripts/split-jurisdictions.py)
  chase({ counties: ['Grayson/e16', 'Roanoke/n81', 'Washington/n81', 'Smyth/e16+n81'] }, [['08-01', '09-27']]),
  chase({ properties: ['Cavalier WMA'] }, [['08-09', '08-23']]),
  chase(
    {
      counties: [
        'Amelia', 'Campbell/east', 'Charles City', 'Cumberland', 'Dinwiddie', 'Essex', 'Gloucester', 'Isle of Wight',
        'James City', 'King and Queen', 'King George', 'King William', 'Lancaster', 'Mathews', 'Middlesex', 'New Kent',
        'Northumberland', 'Nottoway', 'Pittsylvania/east', 'Prince George', 'Richmond', 'Southampton', 'Surry', 'Sussex',
        'Westmoreland', 'York',
      ],
    },
    [['11-15', '11-29']],
  ),
  chase({ counties: ['Appomattox', 'Buckingham'] }, [['11-15', '11-27']]),
  chase({ counties: ['Appomattox', 'Buckingham'] }, [DEC_NO_SUN], ['Dec 1 – 20 excludes Sundays.'], MON_SAT),
  chase({ counties: ['Clarke', 'Fauquier', 'Frederick'] }, [DEC_NO_SUN], ['Dec 1 – 20 excludes Sundays.'], MON_SAT),
);

// Dogs (p. 30–31) -------------------------------------------------------------
const NO_DOG_WMAS = [
  'Amelia WMA', 'C.F. Phelps WMA', 'Doe Creek WMA', 'Featherfin WMA', 'Thompson WMA', 'Mattaponi WMA',
  'Mattaponi Bluffs WMA', 'Merrimac Farm WMA', 'Oakley Forest WMA', 'Flippo-Gentry WMA', 'Pettigrew WMA',
  'Robert W. Duncan WMA', 'Tye River WMA', 'Ware Creek WMA',
];

const dogRules: DogRule[] = [
  {
    where: { counties: [...WEST_COUNTIES, 'Amherst/west', 'Bedford', 'Nelson/west'] },
    dates: [['11-24', '11-30']],
    note: 'No hounds Nov 24–30 west of the Blue Ridge (and in Bedford, Amherst west of Rt. 29, Nelson west of Rt. 151).',
  },
  { where: { counties: ['Madison', 'Greene'] }, dates: [['11-24', '11-28']], note: 'No hounds Nov 24–28 in Madison and Greene.' },
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
  { where: { properties: ['Cavalier WMA'] }, note: 'Dogs may only be used here during the Aug 9–23 hound training season.' },
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

// Facts (p. 28) -----------------------------------------------------------------
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
  info('closed-shore', 'access', { counties: SHORE },
    'Closed season for bear in Accomack and Northampton counties in 2025–26 (no archery, muzzleloader, or firearms season).'),
  info('bait', 'methods', { statewide: true }, 'Feeding or baiting bears is illegal year-round, statewide.'),
  info('report', 'methods', { statewide: true }, 'Report your harvest (Go Outdoors Virginia app, website, or phone) and submit a tooth.'),
  info('mange', 'methods', { statewide: true },
    'Avoid harvesting bears showing signs of mange. A harvested mangy bear must still be tagged and reported; email bearmange@dwr.virginia.gov with a photo and the confirmation number (DWR will contact you about license status).'),
  // Legal Use of Firearms and Archery Tackle (p. 24)
  info('weapons', 'methods', { statewide: true },
    'Legal for bear: rifles/pistols .23 caliber or larger (pistols ≥350 ft-lb), shotguns up to 10 gauge, muzzleloading rifles .40 caliber or larger, and archery tackle with 7/8-inch broadheads. No air guns or slingbows.'),
  info('road', 'methods', { statewide: true }, 'No shooting a firearm, muzzleloader, arrowgun, or bow in, across, or within the right-of-way of any road.'),
  info('dogs-sunday', 'dogs', { statewide: true }, 'No hunting bears with dogs on Sundays, and no bear hunting within 200 yards of a place of worship on Sundays.'),
  info('dogs-archery', 'dogs', { statewide: true }, 'No dogs (other than tracking dogs on a lead) during archery or muzzleloader seasons.'),
  info('local-cities-towns', 'local', [{ anyCity: true }, { anyTown: true }],
    'Cities and towns set their own hunting and weapon restrictions — check local ordinances.'),
  info('access-nps', 'access', { land: ['nps'] }, 'National Park Service land — hunting is prohibited.'),
  info('access-state-park', 'access', { land: ['state_park'] },
    'Hunting in state parks is limited to designated parks, areas, and dates — check DCR before hunting.'),
];

export const bear2025: SpeciesRegs = {
  species: 'bear',
  licenseYear: 2025,
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

/** County groups, exported for coverage tests. SHORE has no bear season in 2025-26. */
export const BEAR_GROUPS_2025 = { SW, B, BLUE_RIDGE, EAST, SHORE };
