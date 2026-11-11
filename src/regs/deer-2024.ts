/**
 * Virginia deer regulations, 2024-25 license year (Jul 1 2024 - Jun 30 2025).
 * Source: 2024–2025 Hunting & Trapping in Virginia digest, pp. 34–45
 *   https://dwr.virginia.gov/wp-content/uploads/media/2024-2025-Virginia-Hunting-and-Trapping-Regulations-Digest.pdf
 *   sha256 5174144546ede3b1249c77ba8fff93c0c22600ffaf95aad70d35594924d7bdda
 *
 * Unlike 2026-27, the 2024-25 digest has no separate public-lands firearms table:
 * each firearms county group applies "in all areas" (private and public land) and
 * lists public-land exceptions to its either-sex days. So each group below is one
 * season rule covering every land type except state parks (which are listed by
 * name where the digest mentions them) plus EitherSexRules for the exceptions.
 * Page numbers in comments are the digest's printed page numbers.
 */
import type { DateRange, EitherSexRule, InfoRule, Land, SeasonRule, SpeciesRegs, Where } from './types';

const d = (mmdd: string): DateRange => [mmdd, mmdd];

const PRIVATE = ['private'] as const;
/** Land types a county group covers ("in all areas"); state parks only where named. */
const GROUP_LANDS: Land[] = ['private', 'national_forest', 'dwr', 'state_forest', 'army_corps'];
const NF_DWR: Land[] = ['national_forest', 'dwr'];
const NF_ABN: Where = { land: ['national_forest'], counties: ['Amherst', 'Bedford', 'Nelson'] };
const CSV = ['Chesapeake', 'Suffolk/east', 'Virginia Beach'];
const NOVA = ['Arlington', 'Fairfax', 'Loudoun', 'Prince William'];

let n = 0;
const season = (r: Omit<SeasonRule, 'id' | 'species'> & { id?: string }): SeasonRule => ({
  id: r.id ?? `deer-${r.type}-${++n}`,
  species: 'deer',
  ...r,
});

const eitherSex: EitherSexRule[] = [];

// ---------------------------------------------------------------------------
// Youth & apprentice weekend (p. 37)
// ---------------------------------------------------------------------------
const youth: SeasonRule[] = [
  season({
    id: 'deer-youth-weekend',
    type: 'youth',
    label: 'Youth & Apprentice Deer Hunting Weekend',
    dates: [['09-28', '09-29']],
    where: { statewide: true },
    take: 'either-sex',
    youthOnly: true,
    notes: [
      'Hunters 15 and under, or apprentice license holders, accompanied by a licensed adult (who may not carry a weapon).',
      'Deer of either sex. Blaze color required. No deer dogs (tracking dogs allowed).',
    ],
    ref: 'youth-and-apprentice-deer-hunting-weekend',
  }),
];

// ---------------------------------------------------------------------------
// Archery (p. 38)
// ---------------------------------------------------------------------------
const LATE_ARCHERY_DEC15 = ['Amherst/west', 'Bedford', 'Carroll', 'Floyd', 'Franklin', 'Henry', 'Montgomery', 'Nelson/west', 'Patrick', 'Pulaski'];

const archery: SeasonRule[] = [
  season({
    id: 'deer-archery-early',
    type: 'archery',
    label: 'Early archery',
    dates: [['10-05', '11-15']],
    where: { statewide: true },
    take: 'either-sex',
    ref: 'archery-deer-seasons',
  }),
  season({
    id: 'deer-archery-late-dec1',
    type: 'archery',
    label: 'Late archery',
    dates: [['12-01', '01-04']],
    where: [
      // "In all areas west of the Blue Ridge" except Clarke and Floyd and private lands in Carroll, Frederick, Montgomery, Pulaski
      {
        region: 'west',
        not: [{ counties: ['Clarke', 'Floyd'] }, { land: [...PRIVATE], counties: ['Carroll', 'Frederick', 'Montgomery', 'Pulaski'] }],
      },
      { region: 'west', land: NF_DWR },
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
    dates: [['12-01', '01-04']],
    where: { cities: CSV },
    take: 'either-sex',
    ref: 'archery-deer-seasons',
  }),
  season({
    id: 'deer-archery-late-dec15',
    type: 'archery',
    label: 'Late archery',
    dates: [['12-15', '01-04']],
    // National Forest / Department land here already has the Dec 1 season above.
    where: { countiesInclCities: LATE_ARCHERY_DEC15, not: [NF_ABN, { region: 'west', land: NF_DWR }] },
    take: 'either-sex',
    ref: 'archery-deer-seasons',
  }),
  season({
    id: 'deer-urban-archery',
    type: 'urban_archery',
    label: 'Urban archery (antlerless only)',
    dates: [['09-07', '10-04'], ['01-05', '03-30']],
    where: [
      {
        cities: [
          'Charlottesville', 'Colonial Heights', 'Danville', 'Emporia', 'Franklin', 'Fredericksburg', 'Galax',
          'Harrisonburg', 'Hopewell', 'Lexington', 'Lynchburg', 'Martinsville', 'Poquoson', 'Radford', 'Richmond',
          'Salem', 'Staunton', 'Suffolk', 'Williamsburg', 'Winchester',
        ],
      },
      { cities: ['Chesapeake'], not: [{ land: ['dwr'] }] },
      {
        towns: [
          'Altavista', 'Amherst', 'Bedford', 'Blacksburg', 'Blackstone', 'Boones Mill', 'Buchanan', 'Chatham',
          'Christiansburg', 'Farmville', 'Front Royal', 'Halifax', 'Hillsville', 'Hurt', 'Independence', 'Irvington',
          'Kenbridge', 'Lebanon', 'Pearisburg', 'Pulaski', 'Richlands', 'Rocky Mount', 'Saltville', 'Scottsville',
          'Smithfield', 'Stuart', 'Tazewell', 'Victoria', 'West Point', 'Wytheville',
        ],
      },
      { counties: ['Chesterfield', 'Fairfax', 'James City', 'Stafford', 'York'] },
      { counties: ['Prince William'], not: [{ land: ['dwr'] }] },
      { counties: ['Roanoke'], not: [{ land: NF_DWR }] },
    ],
    take: 'antlerless',
    notes: [
      'Prince William County: not on DOD (military) land or DWR-owned land.',
      'Blaze color required during the early urban season on Youth & Apprentice Weekend.',
      'Lists of available properties are not maintained by DWR or local governments; check the locality for local restrictions.',
    ],
    ref: 'urban-archery-deer-seasons',
  }),
  season({
    id: 'deer-nova-late-archery',
    type: 'urban_archery',
    label: 'NOVA late archery (antlerless only)',
    dates: [['03-31', '04-27']],
    where: { countiesInclCities: NOVA, not: [{ land: ['dwr'] }] },
    take: 'antlerless',
    ref: 'nova-late-archery-season',
  }),
];

// ---------------------------------------------------------------------------
// Muzzleloader (pp. 38–39)
// ---------------------------------------------------------------------------
const LATE_MUZZ_EAST = ['Amherst/west', 'Bedford', 'Franklin', 'Henry', 'Nelson/west', 'Patrick'];
const CITIES_TOWNS_EXCEPT_CSV: Where[] = [
  { anyCity: true, not: [{ cities: ['Chesapeake', 'Suffolk', 'Virginia Beach'] }] },
  { anyTown: true },
];

const muzzleloader: SeasonRule[] = [
  season({
    id: 'deer-muzz-early',
    type: 'muzzleloader',
    label: 'Early muzzleloader',
    dates: [['11-02', '11-15']],
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
    dates: [['12-14', '01-04']],
    where: [{ countiesInclCities: LATE_MUZZ_EAST }, { cities: CSV }],
    take: 'by-days',
    esGroup: 'muzz-late-east',
    ref: 'late-muzzleloader-season-east-of-the-blue-ridge',
  }),
  season({
    id: 'deer-muzz-late-west',
    type: 'muzzleloader',
    label: 'Late muzzleloader',
    dates: [['12-14', '01-04']],
    where: { region: 'west', not: [{ counties: ['Clarke'] }, { land: [...PRIVATE], counties: ['Frederick'] }] },
    take: 'by-days',
    esGroup: 'muzz-late-west',
    ref: 'late-muzzleloader-season-west-of-the-blue-ridge',
  }),
];

eitherSex.push(
  // Early muzzleloader, east of the Blue Ridge: full season in all areas unless noted.
  {
    esGroup: 'muzz-early',
    dates: 'full',
    where: {
      region: 'east',
      not: [
        { land: ['state_forest'] },
        { land: ['state_park'], not: [{ properties: ['Occoneechee State Park'] }] },
        { land: ['dwr'], not: [{ properties: ['Merrimac Farm WMA'] }] },
        { properties: ['Philpott Reservoir'] },
        NF_ABN,
      ],
    },
  },
  {
    esGroup: 'muzz-early',
    dates: [d('11-09')],
    where: [
      { region: 'east', land: ['state_forest'] },
      { region: 'east', land: ['state_park'], not: [{ properties: ['Occoneechee State Park'] }] },
      { region: 'east', land: ['dwr'], not: [{ properties: ['Merrimac Farm WMA'] }] },
      { properties: ['Philpott Reservoir'] },
    ],
  },
  // Early muzzleloader, west of the Blue Ridge
  {
    esGroup: 'muzz-early',
    dates: 'full',
    where: {
      land: [...PRIVATE],
      counties: [
        'Augusta', 'Botetourt', 'Carroll', 'Clarke', 'Floyd', 'Frederick', 'Grayson', 'Montgomery', 'Page', 'Pulaski',
        'Roanoke', 'Rockingham/east', 'Scott', 'Shenandoah', 'Smyth', 'Warren', 'Wythe',
      ],
    },
  },
  {
    esGroup: 'muzz-early',
    dates: [d('11-09')],
    where: [
      {
        land: [...PRIVATE],
        counties: ['Alleghany', 'Bath', 'Bland', 'Craig', 'Dickenson', 'Giles', 'Highland', 'Lee', 'Rockbridge', 'Russell', 'Tazewell', 'Wise', 'Washington'],
      },
      { properties: ['Highland WMA'] },
    ],
  },
  // Cities and towns (p. 39): either sex full season during the muzzleloader seasons (except CSV).
  { esGroup: 'muzz-early', dates: 'full', where: CITIES_TOWNS_EXCEPT_CSV },
  { esGroup: 'muzz-late-east', dates: 'full', where: CITIES_TOWNS_EXCEPT_CSV },
  { esGroup: 'muzz-late-west', dates: 'full', where: CITIES_TOWNS_EXCEPT_CSV },
  // Late muzzleloader, east
  {
    esGroup: 'muzz-late-east',
    dates: 'full',
    where: { counties: ['Amherst/west', 'Bedford', 'Franklin', 'Henry', 'Nelson/west', 'Patrick'], not: [{ land: ['national_forest'] }] },
  },
  { esGroup: 'muzz-late-east', dates: [['12-30', '01-04']], where: { cities: CSV } },
  { esGroup: 'muzz-late-east', dates: [d('01-04')], where: NF_ABN },
  // Late muzzleloader, west
  {
    esGroup: 'muzz-late-west',
    dates: 'full',
    where: {
      land: [...PRIVATE],
      counties: [
        'Augusta', 'Botetourt', 'Carroll', 'Craig', 'Floyd', 'Giles', 'Grayson', 'Montgomery', 'Page', 'Pulaski', 'Roanoke',
        'Rockingham/east', 'Scott', 'Shenandoah', 'Smyth', 'Warren', 'Wythe',
      ],
    },
  },
  {
    esGroup: 'muzz-late-west',
    dates: [['12-30', '01-04']],
    where: { land: [...PRIVATE], counties: ['Bland', 'Dickenson', 'Rockbridge', 'Washington'] },
  },
  {
    esGroup: 'muzz-late-west',
    dates: [d('01-04')],
    where: [
      { counties: ['Alleghany', 'Bath', 'Highland', 'Lee', 'Rockingham/west', 'Russell', 'Tazewell', 'Wise'] },
      { region: 'west', land: NF_DWR },
      { properties: ['The Channels', 'Grayson Highlands State Park', 'Hungry Mother State Park'] },
    ],
  },
);

// ---------------------------------------------------------------------------
// Firearms county groups (pp. 40–41). Each applies in all areas of the counties.
// ---------------------------------------------------------------------------
type Es = DateRange[] | 'full' | 'none';
interface Exception {
  where: Where | Where[];
  es: Es;
}

/**
 * A firearms county group: one season rule with its own either-sex group.
 * `es` is the group's default either-sex days; `exceptions` override them for
 * parts of the group (usually public lands).
 */
function group(
  id: string,
  counties: string[],
  dates: DateRange,
  es: Es,
  exceptions: Exception[] = [],
  extra: { cities?: string[]; not?: Where[]; notes?: string[] } = {},
): SeasonRule {
  const esGroup = `fw-${id}`;
  const excluded = exceptions.flatMap((e) => (Array.isArray(e.where) ? e.where : [e.where]));
  if (es !== 'none') {
    eitherSex.push({ esGroup, dates: es, where: { counties, cities: extra.cities, not: excluded } });
  }
  for (const e of exceptions) if (e.es !== 'none') eitherSex.push({ esGroup, dates: e.es, where: e.where });
  const where: Where[] = [{ counties, land: GROUP_LANDS, not: extra.not }];
  if (extra.cities) where.push({ cities: extra.cities, not: extra.not });
  return season({
    id: `deer-firearms-${id}`,
    type: 'firearms',
    label: 'General firearms',
    dates: [dates],
    where,
    take: es === 'none' && exceptions.every((e) => e.es === 'none') ? 'antlered' : 'by-days',
    esGroup,
    notes: extra.notes,
    ref: 'firearms-deer-seasons',
  });
}

/** A property or land with its own season dates (season exceptions and named state parks). */
function own(id: string, where: Where | Where[], dates: DateRange, es: Es, extra: { label?: string; partialNote?: string; notes?: string[] } = {}): SeasonRule {
  return season({
    id: `deer-firearms-${id}`,
    type: 'firearms',
    label: extra.label ?? 'General firearms',
    dates: [dates],
    where,
    take: es === 'full' ? 'either-sex' : es === 'none' ? 'antlered' : 'by-days',
    eitherSexDays: Array.isArray(es) ? es : undefined,
    partialNote: extra.partialNote,
    notes: extra.notes,
    ref: 'firearms-deer-seasons',
  });
}

const NOV16_30: DateRange = ['11-16', '11-30'];
const NOV16_DEC14: DateRange = ['11-16', '12-14'];
const NOV16_JAN4: DateRange = ['11-16', '01-04'];
const N23_30 = [d('11-23'), d('11-30')];
const N23_29_30 = [d('11-23'), d('11-29'), d('11-30')];
const YOUTH_REG = 'Special Youth and Apprentice Antlerless Deer Regulation applies.';

// Lands in the Nov 16 – Dec 14 group that have the shorter Nov 16 – 30 season (p. 41).
const GREEN_SHORT: Where[] = [
  { land: ['national_forest'], counties: ['Amherst', 'Bedford', 'Montgomery', 'Nelson', 'Pulaski'] },
  { land: NF_DWR, counties: ['Carroll', 'Roanoke'] },
];
const NF_FREDERICK: Where = { land: ['national_forest'], counties: ['Frederick'] };
const NAMED_STATE_PARKS = ['Hungry Mother State Park', 'Grayson Highlands State Park', 'Fairy Stone State Park'];

const firearms: SeasonRule[] = [
  // --- West of the Blue Ridge (p. 40–41) ---
  group(
    'w-nov30-full',
    ['Augusta', 'Botetourt', 'Craig', 'Giles', 'Grayson', 'Page', 'Rockingham', 'Shenandoah', 'Smyth', 'Warren', 'Wythe'],
    NOV16_30,
    'full',
    [
      { where: [{ land: NF_DWR, counties: ['Craig', 'Wythe'] }, { land: ['national_forest'], counties: ['Giles'] }], es: N23_29_30 },
      { where: { land: [...PRIVATE], counties: ['Rockingham/west'] }, es: N23_30 },
      {
        where: [
          { land: NF_DWR, counties: ['Augusta', 'Botetourt', 'Smyth'] },
          { land: ['national_forest'], counties: ['Grayson', 'Page', 'Rockingham', 'Shenandoah', 'Warren'] },
        ],
        es: [d('11-30')],
      },
    ],
  ),
  group(
    'w-nov30-bland',
    ['Bland', 'Lee', 'Rockbridge', 'Russell', 'Tazewell'],
    NOV16_30,
    N23_29_30,
    [
      {
        where: [{ land: ['dwr'], counties: ['Russell'] }, { land: NF_DWR, counties: ['Rockbridge', 'Tazewell'] }, { properties: ['The Channels'] }],
        es: [d('11-30')],
      },
      { where: { land: ['national_forest'], counties: ['Lee'] }, es: 'none' },
    ],
    { notes: [YOUTH_REG] },
  ),
  group(
    'w-nov30-scott',
    ['Scott', 'Washington'],
    NOV16_30,
    [d('11-23'), ['11-25', '11-30']],
    [
      { where: [{ land: NF_DWR, counties: ['Washington'] }, { properties: ['The Channels'] }], es: [d('11-30')] },
      { where: { land: ['national_forest'], counties: ['Scott'] }, es: 'none' },
    ],
    { notes: [YOUTH_REG] },
  ),
  group('w-nov30-sw', ['Buchanan', 'Dickenson', 'Wise'], NOV16_30, 'none', [], {
    notes: ['Antlered deer only — no either-sex days. ' + YOUTH_REG],
  }),
  group(
    'w-nov30-apr',
    ['Alleghany', 'Bath', 'Highland'],
    NOV16_30,
    'none',
    [
      { where: [{ land: [...PRIVATE], counties: ['Alleghany', 'Bath', 'Highland'] }, { properties: ['Highland WMA'] }], es: N23_30 },
      {
        where: [
          { land: NF_DWR, counties: ['Bath'], not: [{ properties: ['Highland WMA'] }] },
          { land: ['national_forest'], counties: ['Alleghany', 'Highland'] },
        ],
        es: [d('11-30')],
      },
    ],
  ),
  // --- Nov 16 – Dec 14 groups (p. 41) ---
  group(
    'dec14-green',
    ['Amherst/west', 'Bedford', 'Carroll', 'Floyd', 'Franklin', 'Montgomery', 'Nelson/west', 'Pulaski', 'Roanoke'],
    NOV16_DEC14,
    // The digest prints "November 16 through December 4 (full season)" for this Nov 16 – Dec 14 season.
    [['11-16', '12-04']],
    [{ where: { properties: ['Philpott Reservoir', 'Turkeycock Mountain WMA'] }, es: [d('11-23'), ['12-09', '12-14']] }],
    {
      not: GREEN_SHORT,
      notes: [
        'The digest lists the either-sex days as “November 16 through December 4 (full season)” although the season runs to December 14; Dec 5–14 is shown as antlered only. Confirm with DWR before taking antlerless deer Dec 5–14.',
      ],
    },
  ),
  own('dec14-green-nf-n30', [NF_ABN, { land: NF_DWR, counties: ['Roanoke'] }], NOV16_30, [d('11-30')], {
    label: 'General firearms (National Forest / Department lands)',
  }),
  own('dec14-green-nf-n23', [{ land: ['national_forest'], counties: ['Montgomery', 'Pulaski'] }, { land: NF_DWR, counties: ['Carroll'] }], NOV16_30, N23_30, {
    label: 'General firearms (National Forest / Department lands)',
  }),
  group(
    'dec14-henry-patrick',
    ['Henry', 'Patrick'],
    NOV16_DEC14,
    [...N23_30, ['12-02', '12-14']],
    [{ where: { properties: ['Fairystone Farms WMA', 'Turkeycock Mountain WMA', 'Philpott Reservoir'] }, es: [d('11-23'), ['12-09', '12-14']] }],
  ),
  own('fairy-stone-sp', { properties: ['Fairy Stone State Park'] }, NOV16_DEC14, [d('11-23'), ['12-09', '12-14']], {
    label: 'General firearms (Fairy Stone State Park)',
    partialNote: 'Designated areas of Fairy Stone State Park only.',
  }),
  own('hungry-mother-sp', { properties: ['Hungry Mother State Park'] }, NOV16_30, [d('11-30')], { label: 'General firearms (Hungry Mother State Park)' }),
  own('grayson-highlands-sp', { properties: ['Grayson Highlands State Park'] }, NOV16_30, [d('11-30')], {
    label: 'General firearms (Grayson Highlands State Park)',
    partialNote: 'The digest lists Nov 30 either-sex “on portions of Grayson Highlands State Park”; hunt only where the park allows it.',
  }),
  // --- East of the Blue Ridge, Nov 16 – Jan 4 (pp. 40–41) ---
  group(
    'jan4-tan',
    [
      'Accomack', 'Albemarle', 'Arlington', 'Campbell/west', 'Charles City', 'Chesterfield', 'Clarke', 'Culpeper', 'Fairfax',
      'Fauquier', 'Frederick', 'Greene', 'Goochland', 'Hanover', 'Henrico', 'Isle of Wight', 'James City', 'Loudoun', 'Madison',
      'New Kent', 'Northampton', 'Orange', 'Pittsylvania/west', 'Powhatan', 'Prince George', 'Prince William', 'Rappahannock',
      'Southampton', 'Spotsylvania', 'Stafford', 'Surry', 'Sussex', 'York',
    ],
    NOV16_JAN4,
    'full',
    [
      { where: { properties: ['Thompson WMA', 'Oakley Forest WMA', 'Powhatan WMA', 'Rapidan WMA'] }, es: [...N23_30, ['12-23', '01-04']] },
      { where: { properties: ['Ragged Island WMA', 'Chickahominy WMA'] }, es: 'none' },
    ],
    {
      cities: ['Suffolk/west', 'Hampton', 'Richmond', 'Lynchburg', 'Newport News'],
      not: [{ properties: ['C.F. Phelps WMA', 'Hog Island WMA'] }, NF_FREDERICK],
    },
  ),
  own('cf-phelps', { properties: ['C.F. Phelps WMA'] }, NOV16_30, [d('11-23')], { label: 'General firearms (C.F. Phelps WMA)' }),
  own('frederick-nf', NF_FREDERICK, NOV16_30, [d('11-30')], { label: 'General firearms (National Forest)' }),
  own('hog-island', { properties: ['Hog Island WMA'] }, NOV16_JAN4, 'none', {
    label: 'General firearms (Hog Island WMA)',
    partialNote:
      'Antlered only on the Carlisle and Stewart tracts. The digest does not list other Hog Island tracts separately (they would follow Surry County’s full-season either-sex days).',
  }),
  group(
    'jan4-red',
    ['Appomattox', 'Brunswick', 'Buckingham', 'Caroline', 'Charlotte', 'Dinwiddie', 'Essex', 'Greensville', 'Lunenburg', 'Mathews', 'Mecklenburg', 'Middlesex', 'Prince Edward'],
    NOV16_JAN4,
    [...N23_30, ['12-30', '01-04']],
    [
      { where: { properties: ['Featherfin WMA'] }, es: [...N23_30, ['12-07', '01-04']] },
      { where: { properties: ['Appomattox-Buckingham State Forest', 'Prince Edward-Gallion'] }, es: N23_30 },
    ],
  ),
  group(
    'jan4-white',
    ['Amelia', 'Cumberland', 'Gloucester', 'Halifax', 'King and Queen', 'King William', 'Nottoway'],
    NOV16_JAN4,
    [...N23_30, ['12-23', '01-04']],
    [
      { where: { properties: ['Amelia WMA'] }, es: [...N23_30, ['12-30', '01-04']] },
      { where: { properties: ['Cumberland'] }, es: N23_30 },
    ],
  ),
  group(
    'jan4-orange',
    ['Amherst/east', 'Campbell/east', 'Fluvanna', 'King George', 'Lancaster', 'Louisa', 'Nelson/east', 'Northumberland', 'Pittsylvania/east', 'Richmond', 'Westmoreland'],
    NOV16_JAN4,
    [...N23_30, ['12-09', '01-04']],
    [
      { where: { properties: ['Hardware River WMA'] }, es: [...N23_30, ['12-23', '01-04']] },
      { where: { properties: ['James River WMA', 'Tye River WMA'] }, es: [d('11-23'), ['12-30', '01-04']] },
      // The digest lists "November 25, and January 4, 5 and 6" though the season ends Jan 4.
      { where: { properties: ['White Oak Mountain WMA'] }, es: [d('11-25'), ['01-04', '01-06']] },
    ],
    { not: [NF_ABN] },
  ),
  // --- Chesapeake, Suffolk (east of the Dismal Swamp line), Virginia Beach (p. 41) ---
  season({
    id: 'deer-firearms-csv',
    type: 'firearms',
    label: 'General firearms',
    dates: [['10-01', '11-30']],
    where: { cities: CSV },
    take: 'either-sex',
    notes: ['Overlaps the early archery season.'],
    ref: 'firearms-deer-seasons',
  }),
  // --- Incorporated cities and towns (p. 42) ---
  season({
    id: 'deer-firearms-cities-towns',
    type: 'firearms',
    label: 'Firearms (cities & towns)',
    dates: [NOV16_JAN4],
    where: CITIES_TOWNS_EXCEPT_CSV,
    take: 'either-sex',
    notes: ['Only where the city or town allows firearms deer hunting, and only with the weapons it authorizes.'],
    ref: 'firearms-deer-seasons',
  }),
];

// ---------------------------------------------------------------------------
// Early & late antlerless-only firearms seasons (p. 41)
// ---------------------------------------------------------------------------
const antlerlessFirearms: SeasonRule[] = [
  season({
    id: 'deer-antlerless-black-diamond',
    type: 'antlerless_firearms',
    label: 'Antlerless-only firearms',
    dates: [['09-07', '10-04'], ['01-05', '03-30']],
    where: [
      { countiesInclCities: NOVA, not: [{ land: ['dwr'] }] },
      {
        land: [...PRIVATE],
        counties: [
          'Carroll', 'Culpeper', 'Clarke', 'Fauquier', 'Floyd', 'Frederick', 'Madison', 'Montgomery', 'Orange', 'Page',
          'Pulaski', 'Rappahannock', 'Shenandoah', 'Warren', 'York',
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
    dates: [['09-07', '10-04'], ['01-05', '01-31']],
    where: { land: [...PRIVATE], counties: ['Bedford'] },
    take: 'antlerless',
    notes: ['No dogs.'],
    ref: 'early-and-late-antlerless-only-firearms-deer-seasons',
  }),
];

// ---------------------------------------------------------------------------
// Place facts: bag limits, Earn-a-Buck, antler point restrictions, bonus permits, dogs (pp. 34–36, 42)
// ---------------------------------------------------------------------------
const info = (id: string, topic: InfoRule['topic'], where: Where | Where[], text: string, dates?: DateRange[]): InfoRule => ({
  id: `deer-${id}`,
  species: 'deer',
  topic,
  where,
  text,
  dates,
});

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
  info('bag-public-one', 'bag', { land: NF_DWR },
    'Only 1 deer per day on National Forest and Department-owned/managed lands.'),
  info('youth-antlerless', 'bag', { statewide: true },
    'Youth (15 and under) and apprentice hunters may take 1 antlerless deer per license year on days that are not either-sex days, during the muzzleloader and firearms seasons, on all lands.'),
  info('apr', 'apr', { counties: ['Alleghany', 'Bath', 'Highland', 'Rockbridge'] },
    'Antler point restriction: if you kill two antlered bucks in a license year here, at least one must have 4+ points (1 inch or longer) on one side.'),
  info('eab-private', 'eab',
    {
      land: ['private'],
      counties: [
        'Accomack', 'Albemarle', 'Amherst/west', 'Augusta', 'Bedford', 'Botetourt', 'Carroll', 'Clarke', 'Culpeper',
        'Fauquier', 'Floyd', 'Franklin', 'Frederick', 'Greene', 'Grayson', 'Hanover', 'Henrico', 'James City', 'Madison',
        'Montgomery', 'Orange', 'Page', 'Prince George', 'Pulaski', 'Rappahannock', 'Roanoke', 'Rockingham/east',
        'Shenandoah', 'Stafford', 'Warren', 'Wythe', 'York',
      ],
    },
    'Earn a Buck (private lands): you must take 1 antlerless deer on private land in this county before your 2nd antlered deer here (and 2 antlerless before a 3rd, east of the Blue Ridge).'),
  info('eab-nova', 'eab', { counties: NOVA },
    'Earn a Buck (all lands except DoD): 1 antlerless deer in this county before your 2nd antlered deer, 2 before your 3rd.'),
  info('eab-cities-towns', 'eab', CITIES_TOWNS_EXCEPT_CSV,
    'Earn a Buck: each city/town is its own unit — 1 antlerless deer here before your 2nd antlered deer here (2 before a 3rd, east of the Blue Ridge).'),
  info('bonus-ok', 'bonus',
    { statewide: true, not: [{ land: NF_DWR }, { counties: ['Buchanan', 'Dickenson', 'Wise'] }] },
    'Bonus deer permits valid (antlerless only, on either-sex days, in addition to the season limit).'),
  info('bonus-no-public', 'bonus', { land: NF_DWR },
    'Bonus deer permits are NOT valid on National Forest or Department-owned lands.'),
  info('bonus-no-sw', 'bonus', { counties: ['Buchanan', 'Dickenson', 'Wise'] },
    'Bonus deer permits are NOT valid in Buchanan, Dickenson, and Wise counties.'),
  info('dogs-prohibited', 'dogs', DOGS_PROHIBITED,
    'Deer hunting with dogs is prohibited here (tracking dogs on a lead are allowed).'),
  info('dogs-madison-greene', 'dogs', { counties: ['Madison', 'Greene'] },
    'No deer dogs Nov 16 – Nov 29 in Madison and Greene counties.', [['11-16', '11-29']]),
  info('dogs-allowed', 'dogs', { region: 'east', not: DOGS_PROHIBITED },
    'Deer dogs allowed during the general firearms season only — never on Sundays, during archery/muzzleloader/antlerless-only seasons, on youth weekend, or on many military areas.'),
  info('local-cities', 'local', [{ cities: ['Hampton', 'Richmond', 'Newport News'] }, { counties: ['Arlington'] }],
    'Hampton, Richmond, and Newport News: archery only during the firearms season (no special permit needed for archery). Arlington: local ordinance prohibits discharging firearms.'),
  info('local-lynchburg', 'local', { cities: ['Lynchburg'] },
    'Lynchburg: firearms season only on private lands with a special permit from the Chief of Police.'),
  info('local-fairfax', 'local', { counties: ['Fairfax'] },
    'Fairfax County: firearm hunting is restricted by location and parcel size (contact Fairfax Animal Control). No parcel-size restrictions for archery.'),
  info('local-cities-towns', 'local', [{ anyCity: true }, { anyTown: true }],
    'Cities and towns set their own weapon restrictions — check local firearms ordinances.'),
  info('feeding', 'methods',
    {
      countiesInclCities: [
        'Albemarle', 'Arlington', 'Augusta', 'Bedford', 'Bland', 'Botetourt', 'Buchanan', 'Carroll', 'Clarke', 'Craig',
        'Culpeper', 'Dickenson', 'Fairfax', 'Fauquier', 'Floyd', 'Fluvanna', 'Franklin', 'Frederick', 'Giles', 'Grayson',
        'Greene', 'Henry', 'Loudoun', 'Louisa', 'Madison', 'Montgomery', 'Orange', 'Page', 'Patrick', 'Prince William',
        'Pulaski', 'Rappahannock', 'Roanoke', 'Rockingham', 'Russell', 'Shenandoah', 'Smyth', 'Spotsylvania', 'Stafford',
        'Warren', 'Washington', 'Wise', 'Wythe',
      ],
    },
    'Feeding deer is prohibited year-round here (p. 45).'),
  info('weapons', 'methods', { statewide: true },
    'Legal for deer: rifles/pistols .23 caliber or larger, shotguns up to 10 gauge, muzzleloading rifles .40 caliber or larger, air rifles .35 caliber or larger, and archery tackle with 7/8-inch broadheads.'),
  info('weapons-overlap', 'methods', { statewide: true },
    'Muzzleloaders and archery tackle may also be used during firearms seasons (subject to the firearms either-sex days and local ordinances).'),
  info('access-nps', 'access', { land: ['nps'] },
    'National Park Service land — hunting is prohibited.'),
  info('access-state-park', 'access', { land: ['state_park'] },
    'Hunting in state parks is limited to designated parks, areas, and dates — check DCR before hunting.'),
];

export const deer2024: SpeciesRegs = {
  species: 'deer',
  licenseYear: 2024,
  source: 'https://dwr.virginia.gov/wp-content/uploads/media/2024-2025-Virginia-Hunting-and-Trapping-Regulations-Digest.pdf',
  seasons: [...youth, ...archery, ...muzzleloader, ...firearms, ...antlerlessFirearms],
  eitherSex,
  info: infos,
  unlistedPublicPolicy: {
    national_forest: { status: 'private-rules', note: 'National Forest land outside the digest’s county groups — follows the county’s seasons.' },
    dwr: { status: 'check', note: 'Refer to the rules posted for this property (DWR “Explore the Wild”).' },
    state_forest: { status: 'private-rules', note: 'Follows the county’s seasons. Check DOF for access/permit rules.' },
    army_corps: { status: 'private-rules', note: 'Follows the county’s seasons.' },
    nps: { status: 'closed', note: 'Hunting is prohibited on National Park Service land.' },
    state_park: { status: 'check', note: 'Most state parks are closed to hunting or open only for special hunts — check DCR.' },
  },
};

/** Named state parks with firearms seasons in the 2024-25 digest (for tests). */
export const DEER_2024_STATE_PARKS = NAMED_STATE_PARKS;
