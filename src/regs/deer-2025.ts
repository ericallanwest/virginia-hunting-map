/**
 * Virginia deer regulations, 2025-26 license year (Jul 1 2025 - Jun 30 2026).
 * Source: 2025–2026 Virginia Hunting & Trapping Regulations digest,
 *   https://www.eregulations.com/assets/docs/guides/25VAHD_LR.pdf
 *   sha256 19e03a913e95ac37bef013418087802de23e8726d6c321c82d6c2390b65c7075
 * cross-checked with the eRegulations web copy (sources/regs/2025-26/eregulations/).
 *
 * "p. N" below is the PDF page (the printed page number is N − 2).
 * Dates are 'MM-DD': Jul–Dec in 2025, Jan–Jun in 2026. Differences from 2026–27
 * are listed in docs/changes-2025.md.
 */
import type { DateRange, EitherSexRule, InfoRule, SeasonRule, SpeciesRegs, Where } from './types';

export const DEER_2025_SOURCE = 'https://www.eregulations.com/assets/docs/guides/25VAHD_LR.pdf';

const ALL_SEASON_FW: DateRange = ['11-15', '01-03'];
const SHORT_FW: DateRange = ['11-15', '11-29'];
const FW_DEC13: DateRange = ['11-15', '12-13'];
const d = (mmdd: string): DateRange => [mmdd, mmdd];

const PRIVATE = ['private'] as const;
const NF_ABN: Where = { land: ['national_forest'], counties: ['Amherst', 'Bedford', 'Nelson'] };
const CSV = ['Chesapeake', 'Suffolk/east', 'Virginia Beach'];
const NOVA = ['Arlington', 'Fairfax', 'Loudoun', 'Prince William'];

let n = 0;
const season = (r: Omit<SeasonRule, 'id' | 'species'> & { id?: string }): SeasonRule => ({
  id: r.id ?? `deer-${r.type}-${++n}`,
  species: 'deer',
  ...r,
});

// ---------------------------------------------------------------------------
// Youth & apprentice weekend (p. 37)
// ---------------------------------------------------------------------------
const youth: SeasonRule[] = [
  season({
    id: 'deer-youth-weekend',
    type: 'youth',
    label: 'Youth & Apprentice Deer Hunting Weekend',
    dates: [['09-27', '09-28']],
    where: { statewide: true },
    take: 'either-sex',
    youthOnly: true,
    notes: [
      'Hunters 15 and under, or apprentice license holders, accompanied by a licensed adult (who may not carry a weapon).',
      'Any legal deer weapon. Blaze color required. No deer dogs (tracking dogs allowed).',
    ],
    ref: 'youth-and-apprentice-deer-hunting-weekend',
  }),
];

// ---------------------------------------------------------------------------
// Archery (p. 38)
// ---------------------------------------------------------------------------
const archery: SeasonRule[] = [
  season({
    id: 'deer-archery-early',
    type: 'archery',
    label: 'Early archery',
    dates: [['10-04', '11-14']],
    where: { statewide: true },
    take: 'either-sex',
    ref: 'archery-deer-seasons',
  }),
  season({
    id: 'deer-archery-late-dec13',
    type: 'archery',
    label: 'Late archery',
    dates: [['12-14', '01-03']],
    where: [
      { counties: ['Henry', 'Patrick'] },
      {
        region: 'west',
        not: [
          { counties: ['Clarke', 'Floyd'] },
          {
            land: [...PRIVATE],
            counties: ['Carroll', 'Frederick', 'Montgomery', 'Page', 'Pulaski', 'Roanoke', 'Rockingham/east', 'Shenandoah', 'Warren', 'Wythe'],
          },
        ],
      },
    ],
    take: 'either-sex',
    ref: 'archery-deer-seasons',
  }),
  season({
    id: 'deer-archery-late-nov29',
    type: 'archery',
    label: 'Late archery',
    dates: [['11-30', '01-03']],
    where: [
      {
        countiesInclCities: ['Alleghany', 'Bath', 'Bland', 'Buchanan', 'Dickenson', 'Highland', 'Lee', 'Rockingham/west', 'Russell', 'Scott', 'Tazewell', 'Wise'],
      },
      { region: 'west', land: ['national_forest', 'dwr'] },
      { properties: ['C.F. Phelps WMA'] },
      NF_ABN,
    ],
    take: 'either-sex',
    ref: 'archery-deer-seasons',
  }),
  season({
    id: 'deer-archery-late-csv',
    type: 'archery',
    label: 'Late archery',
    dates: [['12-01', '01-03']],
    where: { cities: CSV },
    take: 'either-sex',
    ref: 'archery-deer-seasons',
  }),
  season({
    id: 'deer-urban-archery',
    type: 'urban_archery',
    label: 'Urban archery (antlerless only)',
    dates: [['09-06', '10-03'], ['01-04', '03-29']],
    where: [
      {
        cities: [
          'Charlottesville', 'Colonial Heights', 'Danville', 'Emporia', 'Franklin', 'Fredericksburg', 'Galax',
          'Harrisonburg', 'Hopewell', 'Lexington', 'Lynchburg', 'Martinsville', 'Newport News', 'Poquoson',
          'Radford', 'Richmond', 'Salem', 'Staunton', 'Suffolk', 'Winchester',
        ],
      },
      { cities: ['Chesapeake'], not: [{ land: ['dwr'] }] },
      {
        // 2025-26 list has no Cedar Bluff (added in 2026-27).
        towns: [
          'Altavista', 'Amherst', 'Bedford', 'Blacksburg', 'Blackstone', 'Boones Mill', 'Buchanan',
          'Chatham', 'Christiansburg', 'Farmville', 'Front Royal', 'Halifax', 'Hillsville', 'Hurt', 'Independence',
          'Irvington', 'Kenbridge', 'Lebanon', 'Pearisburg', 'Pulaski', 'Richlands', 'Rocky Mount', 'Saltville',
          'Scottsville', 'Smithfield', 'Stuart', 'Tazewell', 'Victoria', 'West Point', 'Wytheville',
        ],
      },
      { counties: ['Chesterfield', 'Fairfax', 'James City', 'Stafford', 'York'] },
      { counties: ['Prince William'], not: [{ land: ['dwr'] }] },
      { counties: ['Roanoke'], not: [{ land: ['national_forest', 'dwr'] }] },
    ],
    take: 'antlerless',
    notes: [
      'Prince William County: not on Department of Defense land or DWR-owned land.',
      'Blaze color required during the early urban season on Youth & Apprentice Weekend.',
      'Check the locality for local restrictions; DWR does not maintain lists of available properties.',
    ],
    ref: 'urban-archery-deer-seasons',
  }),
  season({
    id: 'deer-nova-late-archery',
    type: 'urban_archery',
    label: 'NOVA late archery (antlerless only)',
    dates: [['03-30', '04-26']],
    where: { countiesInclCities: NOVA, not: [{ land: ['dwr'] }] },
    take: 'antlerless',
    ref: 'nova-late-archery-season',
  }),
];

// ---------------------------------------------------------------------------
// Muzzleloader (pp. 38–39)
// ---------------------------------------------------------------------------
const muzzleloader: SeasonRule[] = [
  season({
    id: 'deer-muzz-early',
    type: 'muzzleloader',
    label: 'Early muzzleloader',
    dates: [['11-01', '11-14']],
    where: { statewide: true, not: [{ cities: CSV }] },
    take: 'by-days',
    esGroup: 'muzz-early',
    notes: ['Blaze color required except in a tree stand or other stationary location.'],
    ref: 'muzzleloader-deer-seasons',
  }),
  season({
    id: 'deer-muzz-late-east',
    type: 'muzzleloader',
    label: 'Late muzzleloader',
    dates: [['12-13', '01-03']],
    where: [
      { counties: ['Henry', 'Patrick'] },
      { counties: ['Franklin'], land: ['national_forest', 'army_corps', 'dwr'] },
      NF_ABN,
      { cities: CSV },
    ],
    take: 'by-days',
    esGroup: 'muzz-late-east',
    ref: 'late-muzzleloader-season-east-of-the-blue-ridge',
  }),
  season({
    id: 'deer-muzz-late-west',
    type: 'muzzleloader',
    label: 'Late muzzleloader',
    dates: [['12-13', '01-03']],
    where: {
      region: 'west',
      not: [
        { counties: ['Clarke'] },
        {
          // The 2025-26 exception list also names Franklin (east of the Blue Ridge), which has no effect here.
          land: [...PRIVATE],
          counties: ['Carroll', 'Floyd', 'Frederick', 'Montgomery', 'Page', 'Pulaski', 'Roanoke', 'Rockingham/east', 'Shenandoah', 'Warren', 'Wythe'],
        },
      ],
    },
    take: 'by-days',
    esGroup: 'muzz-late-west',
    ref: 'late-muzzleloader-season-west-of-the-blue-ridge',
  }),
];

/** "Muzzleloader either-sex deer hunting for incorporated cities and towns" (p. 39): full season in both muzzleloader seasons. */
const CITIES_TOWNS_WEST: Where[] = [
  { region: 'west', anyCity: true },
  { region: 'west', anyTown: true },
];

const eitherSex: EitherSexRule[] = [
  // Early muzzleloader, east of the Blue Ridge (p. 38)
  {
    esGroup: 'muzz-early',
    dates: 'full',
    where: {
      region: 'east',
      not: [
        { land: ['state_forest', 'army_corps', 'national_forest'] },
        { land: ['state_park'], not: [{ properties: ['Occoneechee State Park'] }] },
        { land: ['dwr'], not: [{ properties: ['Merrimac Farm WMA'] }] },
      ],
    },
  },
  {
    // Nov 8: state forests, state parks (except Occoneechee), DWR lands (except Merrimac Farm), and Philpott Reservoir.
    esGroup: 'muzz-early',
    dates: [d('11-08')],
    where: { region: 'east', land: ['state_forest', 'state_park', 'dwr', 'army_corps'] },
  },
  // Early muzzleloader, west of the Blue Ridge (p. 39)
  {
    esGroup: 'muzz-early',
    dates: 'full',
    where: [
      {
        land: [...PRIVATE],
        counties: [
          'Augusta', 'Botetourt', 'Carroll', 'Clarke', 'Craig', 'Floyd', 'Frederick', 'Giles', 'Grayson', 'Montgomery',
          'Page', 'Pulaski', 'Roanoke', 'Rockingham/east', 'Scott', 'Shenandoah', 'Smyth', 'Warren', 'Wythe',
        ],
      },
      ...CITIES_TOWNS_WEST,
    ],
  },
  {
    // Nov 8 (the 2025-26 list also repeats Craig and Giles, which are full-season above).
    esGroup: 'muzz-early',
    dates: [d('11-08')],
    where: [
      {
        land: [...PRIVATE],
        counties: [
          'Alleghany', 'Bath', 'Bland', 'Buchanan', 'Craig', 'Dickenson', 'Giles', 'Highland', 'Lee', 'Rockbridge', 'Russell',
          'Tazewell', 'Wise', 'Washington',
        ],
      },
      { properties: ['Highland WMA'] },
    ],
  },
  // Late muzzleloader, east (p. 39): full season only in Henry and Patrick in 2025-26.
  { esGroup: 'muzz-late-east', dates: 'full', where: { counties: ['Henry', 'Patrick'] } },
  { esGroup: 'muzz-late-east', dates: [['12-29', '01-03']], where: { cities: CSV } },
  { esGroup: 'muzz-late-east', dates: [d('01-03')], where: NF_ABN },
  // Late muzzleloader, west (p. 39)
  {
    esGroup: 'muzz-late-west',
    dates: 'full',
    where: [
      { land: [...PRIVATE], counties: ['Augusta', 'Botetourt', 'Craig', 'Giles', 'Grayson', 'Scott', 'Smyth'] },
      ...CITIES_TOWNS_WEST,
    ],
  },
  {
    esGroup: 'muzz-late-west',
    dates: [['12-29', '01-03']],
    where: { land: [...PRIVATE], counties: ['Bland', 'Dickenson', 'Rockbridge', 'Washington'] },
  },
  {
    esGroup: 'muzz-late-west',
    dates: [d('01-03')],
    where: [
      { counties: ['Alleghany', 'Bath', 'Buchanan', 'Highland', 'Lee', 'Rockingham/west', 'Russell', 'Tazewell', 'Wise'] },
      { region: 'west', land: ['national_forest', 'dwr'] },
      { properties: ['The Channels', 'Grayson Highlands State Park', 'Hungry Mother State Park', 'Flannagan Reservoir'] },
    ],
  },
];

// ---------------------------------------------------------------------------
// Firearms — private lands (and public lands not in the public-lands tables) (pp. 40–41)
// ---------------------------------------------------------------------------
const pf = (counties: string[], dates: DateRange, es: DateRange[] | 'full' | 'none', extra: Partial<SeasonRule> = {}, whereExtra: Where = {}) =>
  season({
    type: 'firearms',
    label: 'General firearms (private lands)',
    dates: [dates],
    where: { land: [...PRIVATE], counties, ...whereExtra },
    take: es === 'full' ? 'either-sex' : es === 'none' ? 'antlered' : 'by-days',
    eitherSexDays: Array.isArray(es) ? es : undefined,
    ref: 'private-lands-firearms-deer-seasons',
    ...extra,
  });

const firearmsPrivate: SeasonRule[] = [
  pf(['Buchanan'], FW_DEC13, 'none', {
    notes: ['Antlered only — Youth & Apprentice Antlerless Deer Regulation applies.'],
  }),
  pf(['Dickenson', 'Wise'], FW_DEC13, [d('11-29')]),
  pf(['Alleghany', 'Bath', 'Highland', 'Lee', 'Rockingham/west'], FW_DEC13, [d('11-22'), d('11-28'), d('11-29')]),
  pf(['Henry', 'Patrick'], FW_DEC13, [d('11-22'), d('11-29'), ['12-01', '12-13']]),
  pf(['Bland', 'Russell', 'Scott', 'Tazewell'], FW_DEC13, [['11-22', '11-29']]),
  pf(['Augusta', 'Botetourt', 'Craig', 'Giles', 'Grayson', 'Rockbridge', 'Smyth', 'Washington'], FW_DEC13, 'full'),
  pf(['Caroline', 'King and Queen', 'King William'], ALL_SEASON_FW, [d('11-22'), d('11-29'), ['12-22', '01-03']]),
  pf(['Amelia', 'Cumberland', 'Gloucester', 'Nottoway'], ALL_SEASON_FW, [d('11-22'), d('11-29'), ['12-06', '01-03']]),
  pf(
    ['Appomattox', 'Brunswick', 'Buckingham', 'Charlotte', 'Dinwiddie', 'Essex', 'Lunenburg', 'Mathews', 'Mecklenburg', 'Middlesex', 'Prince Edward'],
    ALL_SEASON_FW,
    [d('11-22'), d('11-29'), ['12-29', '01-03']],
  ),
  pf(
    [
      'Accomack', 'Albemarle', 'Amherst', 'Arlington', 'Bedford', 'Campbell', 'Carroll', 'Charles City', 'Chesterfield',
      'Clarke', 'Culpeper', 'Fairfax', 'Fauquier', 'Floyd', 'Fluvanna', 'Franklin', 'Frederick', 'Goochland', 'Greene',
      'Greensville', 'Halifax', 'Hanover', 'Henrico', 'Isle of Wight', 'James City', 'King George', 'Lancaster',
      'Loudoun', 'Louisa', 'Madison', 'Montgomery', 'Nelson', 'New Kent', 'Northampton', 'Northumberland', 'Orange',
      'Page', 'Pittsylvania', 'Powhatan', 'Prince George', 'Prince William', 'Pulaski', 'Rappahannock', 'Richmond',
      'Roanoke', 'Rockingham/east', 'Shenandoah', 'Southampton', 'Spotsylvania', 'Stafford', 'Surry', 'Sussex', 'Warren',
      'Westmoreland', 'Wythe', 'York',
    ],
    ALL_SEASON_FW,
    'full',
    {},
    { cities: ['Suffolk/west', 'Hampton', 'Richmond', 'Lynchburg', 'Newport News'] },
  ),
  season({
    id: 'deer-firearms-csv',
    type: 'firearms',
    label: 'General firearms',
    dates: [['10-01', '11-30']],
    where: { cities: CSV },
    take: 'either-sex',
    notes: ['Overlaps the early archery season.'],
    ref: 'private-lands-firearms-deer-seasons',
  }),
  season({
    id: 'deer-firearms-cities-towns',
    type: 'firearms',
    label: 'Firearms (cities & towns)',
    dates: [ALL_SEASON_FW],
    where: [
      { anyCity: true, not: [{ cities: ['Chesapeake', 'Suffolk', 'Virginia Beach'] }] },
      { anyTown: true },
    ],
    take: 'either-sex',
    notes: ['Only where the city or town allows firearms deer hunting, and only with the weapons it authorizes.'],
    ref: 'private-lands-firearms-deer-seasons',
  }),
];

// ---------------------------------------------------------------------------
// Early & late antlerless-only firearms seasons (p. 42)
// ---------------------------------------------------------------------------
const antlerlessFirearms: SeasonRule[] = [
  season({
    id: 'deer-antlerless-black-diamond',
    type: 'antlerless_firearms',
    label: 'Antlerless-only firearms',
    dates: [['09-06', '10-03'], ['01-04', '03-29']],
    where: [
      { countiesInclCities: NOVA, not: [{ land: ['dwr'] }] },
      {
        land: [...PRIVATE],
        counties: [
          'Carroll', 'Culpeper', 'Clarke', 'Fauquier', 'Floyd', 'Frederick', 'Greene', 'Hanover', 'Henrico', 'James City',
          'Madison', 'Montgomery', 'Orange', 'Page', 'Pulaski', 'Rappahannock', 'Shenandoah', 'Warren', 'York',
        ],
      },
    ],
    take: 'antlerless',
    notes: ['No dogs.'],
    ref: 'early-and-late-antlerless-only-firearms-deer-seasons',
  }),
  season({
    id: 'deer-antlerless-yellow-diamond',
    type: 'antlerless_firearms',
    label: 'Antlerless-only firearms',
    dates: [['09-06', '10-03'], ['01-04', '01-31']],
    where: { land: [...PRIVATE], counties: ['Bedford'] },
    take: 'antlerless',
    notes: ['No dogs.'],
    ref: 'early-and-late-antlerless-only-firearms-deer-seasons',
  }),
];

// ---------------------------------------------------------------------------
// Firearms — public lands tables (pp. 42–43)
// ---------------------------------------------------------------------------
type Es = DateRange[] | 'full' | 'none' | 'quota';
const takeOf = (es: Es): SeasonRule['take'] =>
  es === 'full' ? 'either-sex' : es === 'none' ? 'antlered' : es === 'quota' ? 'quota' : 'by-days';

const nf = (where: Where, es: Es) =>
  season({
    type: 'firearms',
    label: 'Firearms (National Forest)',
    dates: [SHORT_FW],
    where: { land: ['national_forest'], ...where },
    take: takeOf(es),
    eitherSexDays: Array.isArray(es) ? es : undefined,
    ref: 'george-washington-and-jefferson-national-forest',
  });

const prop = (name: string, dates: DateRange, es: Es, notes?: string[]) =>
  season({
    type: 'firearms',
    label: `Firearms (${name})`,
    dates: [dates],
    where: { properties: [name] },
    take: takeOf(es),
    eitherSexDays: Array.isArray(es) ? es : undefined,
    notes: es === 'quota' ? ['Refer to quota / managed hunts.', ...(notes ?? [])] : notes,
    ref: 'public-lands-firearms-deer-seasons',
  });

const N22_29 = [d('11-22'), d('11-29')];
const N22_28_29 = [d('11-22'), d('11-28'), d('11-29')];
const NF_LISTED = ['Bland', 'Carroll', 'Craig', 'Dickenson', 'Giles', 'Lee', 'Montgomery', 'Pulaski', 'Scott'];
const FAIRY_STONE_ES: DateRange[] = [d('11-22'), ['12-08', '12-13']];

const firearmsPublic: SeasonRule[] = [
  // George Washington & Jefferson National Forest: "All counties unless otherwise noted" Nov 15–29, either-sex Nov 29.
  nf({ not: [{ countiesInclCities: NF_LISTED }] }, [d('11-29')]),
  nf({ countiesInclCities: ['Bland', 'Craig', 'Giles'] }, N22_28_29),
  nf({ countiesInclCities: ['Carroll', 'Montgomery', 'Pulaski'] }, N22_29),
  nf({ countiesInclCities: ['Dickenson', 'Lee', 'Scott'] }, 'none'),

  // State forests, state parks, Army Corps (names as in public-lands.geojson)
  prop('Appomattox-Buckingham State Forest', ALL_SEASON_FW, N22_29),
  prop('Cumberland', ALL_SEASON_FW, [...N22_29, d('12-06')]),
  prop('Prince Edward-Gallion', ALL_SEASON_FW, N22_29),
  prop('The Channels', SHORT_FW, [d('11-29')]),
  prop('Big Woods', ALL_SEASON_FW, 'full'),
  prop('Grayson Highlands State Park', SHORT_FW, [d('11-29')]),
  prop('Fairy Stone State Park', FW_DEC13, FAIRY_STONE_ES, ['Designated areas only.']),
  prop('Hungry Mother State Park', SHORT_FW, [d('11-29')]),
  prop('Flannagan Reservoir', SHORT_FW, 'none'),
  prop('Philpott Reservoir', FW_DEC13, FAIRY_STONE_ES),

  // Wildlife Management Areas
  prop('Amelia WMA', ALL_SEASON_FW, [...N22_29, ['12-22', '01-03']]),
  prop('Big Survey WMA', SHORT_FW, N22_28_29),
  prop('Big Woods WMA', ALL_SEASON_FW, 'full'),
  prop('Briery Creek WMA', ALL_SEASON_FW, [...N22_29, ['12-29', '01-03']]),
  prop('C.F. Phelps WMA', SHORT_FW, [d('11-22')]),
  prop('Cavalier WMA', ['10-01', '11-30'], [d('10-11'), d('10-18'), ['11-18', '11-30']]),
  prop('Chickahominy WMA', ALL_SEASON_FW, 'none', ['Does by quota hunt only.']),
  prop('Clinch Mountain WMA', SHORT_FW, [d('11-29')]),
  prop('Crooked Creek WMA', SHORT_FW, N22_29),
  prop('Dick Cross WMA', ALL_SEASON_FW, [...N22_29, ['12-29', '01-03']]),
  prop('Fairystone Farms WMA', FW_DEC13, FAIRY_STONE_ES),
  prop('Featherfin WMA', ALL_SEASON_FW, [...N22_29, ['12-06', '01-03']]),
  prop('Flippo-Gentry WMA', ALL_SEASON_FW, 'full'),
  prop('Gathright WMA', SHORT_FW, [d('11-29')]),
  prop('Goshen WMA', SHORT_FW, [d('11-29')]),
  prop('Hardware River WMA', ALL_SEASON_FW, [...N22_29, ['12-22', '01-03']]),
  prop('Havens WMA', SHORT_FW, [d('11-29')]),
  prop('Hidden Valley WMA', SHORT_FW, [d('11-29')]),
  prop('Highland WMA', SHORT_FW, N22_28_29),
  prop('Hog Island WMA', ALL_SEASON_FW, 'quota'),
  prop('Horsepen Lake WMA', ALL_SEASON_FW, [...N22_29, ['12-29', '01-03']]),
  prop('James River WMA', ALL_SEASON_FW, [d('11-22'), ['12-29', '01-03']]),
  prop('Little North Mountain WMA', SHORT_FW, [d('11-29')]),
  prop('Mattaponi WMA', ALL_SEASON_FW, [...N22_29, ['12-29', '01-03']]),
  prop('Mattaponi Bluffs WMA', ALL_SEASON_FW, [...N22_29, ['12-29', '01-03']]),
  prop('Merrimac Farm WMA', ALL_SEASON_FW, 'quota'),
  prop('Oakley Forest WMA', ALL_SEASON_FW, [...N22_29, ['12-22', '01-03']]),
  prop('Pettigrew WMA', ALL_SEASON_FW, [...N22_29, ['12-29', '01-03']]),
  prop('Powhatan WMA', ALL_SEASON_FW, [...N22_29, ['12-22', '01-03']]),
  prop('Princess Anne WMA', ['10-01', '11-30'], [['10-04', '11-30']], ['Quota hunt the first 2 weeks of November.']),
  prop('Ragged Island WMA', ALL_SEASON_FW, 'none'),
  prop('Rapidan WMA', ALL_SEASON_FW, [...N22_29, ['12-22', '01-03']]),
  prop('Robert W. Duncan WMA', ALL_SEASON_FW, [...N22_29, ['12-29', '01-03']]),
  prop('Short Hills WMA', SHORT_FW, [d('11-29')]),
  prop('Stewarts Creek WMA', SHORT_FW, N22_29),
  prop('Thompson WMA', ALL_SEASON_FW, [...N22_29, ['12-22', '01-03']]),
  prop('Turkeycock Mountain WMA', FW_DEC13, [...N22_29, ['12-08', '12-13']]),
  prop('Tye River WMA', ALL_SEASON_FW, [d('11-22'), ['12-29', '01-03']]),
  prop('White Oak Mountain WMA', ALL_SEASON_FW, [...N22_29, ['01-01', '01-03']]),
];

// ---------------------------------------------------------------------------
// Place facts: bag limits (p. 34), Earn-a-Buck (p. 36), bonus permits (p. 34), dogs (p. 44)
// ---------------------------------------------------------------------------
const info = (id: string, topic: InfoRule['topic'], where: Where | Where[], text: string, dates?: DateRange[]): InfoRule => ({
  id: `deer-${id}`,
  species: 'deer',
  topic,
  where,
  text,
  dates,
});

const CITIES_TOWNS_EXCEPT_CSV: Where[] = [
  { anyCity: true, not: [{ cities: ['Chesapeake', 'Suffolk', 'Virginia Beach'] }] },
  { anyTown: true },
];

const DOGS_PROHIBITED: Where[] = [
  { region: 'west' },
  {
    counties: ['Bedford', 'Fairfax', 'Franklin', 'Henry', 'Loudoun', 'Northampton', 'Patrick', 'Amherst/west', 'Campbell/west', 'Nelson/west', 'Pittsylvania/west'],
  },
  { cities: ['Lynchburg'] },
  {
    properties: [
      'Amelia WMA', 'Cavalier WMA', 'Doe Creek WMA', 'Featherfin WMA', 'Mattaponi WMA', 'Mattaponi Bluffs WMA',
      'Merrimac Farm WMA', 'Oakley Forest WMA', 'Flippo-Gentry WMA', 'Pettigrew WMA', 'C.F. Phelps WMA', 'Thompson WMA',
      'Robert W. Duncan WMA', 'Tye River WMA', 'Ware Creek WMA',
    ],
  },
];

const infos: InfoRule[] = [
  info('bag-east', 'bag', { region: 'east', not: [NF_ABN] },
    '2 deer per day, 6 per license year — no more than 3 antlered; at least 3 must be antlerless.'),
  info('bag-west', 'bag', [{ region: 'west' }, NF_ABN],
    '2 deer per day, 5 per license year — no more than 2 antlered; at least 3 must be antlerless.'),
  info('bag-unlimited-east', 'bag',
    [{ counties: NOVA }, ...CITIES_TOWNS_EXCEPT_CSV.map((w) => ({ ...w, region: 'east' as const }))],
    'Daily bag limit is unlimited here (still no more than 3 antlered per license year).'),
  info('bag-unlimited-west', 'bag', [{ region: 'west', anyCity: true }, { region: 'west', anyTown: true }],
    'Daily bag limit is unlimited here (still no more than 2 antlered per license year).'),
  info('bag-public-one', 'bag', { land: ['national_forest', 'dwr'] },
    'Only 1 deer per day on National Forest and Department-owned/managed lands.'),
  info('apr', 'apr', { counties: ['Alleghany', 'Bath', 'Highland', 'Rockbridge'] },
    'Antler point restriction: if you kill two antlered bucks in a license year here, at least one must have 4+ points (1 inch or longer) on one side.'),
  info('eab-private', 'eab',
    {
      land: ['private'],
      counties: [
        'Accomack', 'Albemarle', 'Amherst/west', 'Augusta', 'Bedford', 'Botetourt', 'Carroll', 'Chesterfield', 'Clarke',
        'Craig', 'Culpeper', 'Fauquier', 'Floyd', 'Franklin', 'Frederick', 'Giles', 'Grayson', 'Greene', 'Hanover',
        'Henrico', 'James City', 'Madison', 'Montgomery', 'Orange', 'Page', 'Prince George', 'Pulaski', 'Rappahannock',
        'Roanoke', 'Rockingham/east', 'Shenandoah', 'Spotsylvania', 'Stafford', 'Warren', 'Wythe', 'York',
      ],
    },
    'Earn a Buck (private lands): you must take 1 antlerless deer on private land in this county before your 2nd antlered deer here (and 2 antlerless before a 3rd, east of the Blue Ridge).'),
  info('eab-nova', 'eab', { counties: NOVA },
    'Earn a Buck (all lands except DoD): 1 antlerless deer in this county before your 2nd antlered deer, 2 before your 3rd.'),
  info('eab-cities-towns', 'eab', CITIES_TOWNS_EXCEPT_CSV,
    'Earn a Buck: each city/town is its own unit — 1 antlerless deer here before your 2nd antlered deer here (2 before a 3rd, east of the Blue Ridge).'),
  info('bonus-ok', 'bonus',
    { statewide: true, not: [{ land: ['national_forest', 'dwr'] }, { counties: ['Buchanan', 'Dickenson', 'Wise'] }] },
    'Bonus deer permits valid (antlerless only, on either-sex days, in addition to the season limit).'),
  info('bonus-no-public', 'bonus', { land: ['national_forest', 'dwr'] },
    'Bonus deer permits are NOT valid on National Forest or Department-owned lands.'),
  info('bonus-no-sw', 'bonus', { counties: ['Buchanan', 'Dickenson', 'Wise'] },
    'Bonus deer permits are NOT valid in Buchanan, Dickenson, and Wise counties.'),
  info('dogs-prohibited', 'dogs', DOGS_PROHIBITED,
    'Deer hunting with dogs is prohibited here (tracking dogs on a lead are allowed).'),
  info('dogs-madison-greene', 'dogs', { counties: ['Madison', 'Greene'] },
    'No deer dogs Nov 15 – Nov 28 in Madison and Greene counties.', [['11-15', '11-28']]),
  info('dogs-allowed', 'dogs', { region: 'east', not: DOGS_PROHIBITED },
    'Deer dogs allowed during the general firearms season only — never on Sundays, during archery/muzzleloader/antlerless-only seasons, or on youth weekend.'),
  info('local-cities-towns', 'local', [{ anyCity: true }, { anyTown: true }],
    'Cities and towns set their own weapon restrictions — check local firearms ordinances.'),
  // Legal Use of Firearms and Archery Tackle (p. 24)
  info('weapons', 'methods', { statewide: true },
    'Legal for deer: rifles/pistols .23 caliber or larger (pistols ≥350 ft-lb), shotguns up to 10 gauge, muzzleloading rifles .40 caliber or larger, air guns .35 caliber or larger, and archery tackle with 7/8-inch broadheads.'),
  info('weapons-overlap', 'methods', { statewide: true },
    'Muzzleloaders, arrowguns, and archery tackle may also be used during firearms seasons, and archery tackle during muzzleloader seasons (subject to local ordinances).'),
  info('road', 'methods', { statewide: true }, 'No shooting a firearm, muzzleloader, arrowgun, or bow in, across, or within the right-of-way of any road.'),
  info('boat', 'methods', { statewide: true }, 'Deer may not be killed from a boat or other watercraft.'),
  info('access-nps', 'access', { land: ['nps'] },
    'National Park Service land — hunting is prohibited.'),
  info('access-state-park', 'access', { land: ['state_park'] },
    'Hunting in state parks is limited to designated parks, areas, and dates — check DCR before hunting.'),
];

export const deer2025: SpeciesRegs = {
  species: 'deer',
  licenseYear: 2025,
  source: DEER_2025_SOURCE,
  seasons: [...youth, ...archery, ...muzzleloader, ...firearmsPrivate, ...antlerlessFirearms, ...firearmsPublic],
  eitherSex,
  info: infos,
  unlistedPublicPolicy: {
    national_forest: { status: 'private-rules', note: 'National Forest land not in DWR’s table — follows private-land seasons.' },
    dwr: { status: 'check', note: 'Not in DWR’s public-lands firearms table — refer to the rules posted for this property (DWR “Explore the Wild”).' },
    state_forest: { status: 'private-rules', note: 'Not in DWR’s public-lands table, so firearms seasons follow private lands. Check DOF for access/permit rules.' },
    army_corps: { status: 'private-rules', note: 'Not in DWR’s public-lands table — follows private-land seasons.' },
    nps: { status: 'closed', note: 'Hunting is prohibited on National Park Service land.' },
    state_park: { status: 'check', note: 'Most state parks are closed to hunting or open only for special hunts — check DCR.' },
  },
};
