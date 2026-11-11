/**
 * Virginia small game regulations, 2026-27 license year.
 * Source: https://dwr.virginia.gov/hunting/regulations/smallgame/ (snapshot in sources/regs/smallgame.html)
 */
import { WEST_OF_I95_CITIES, WEST_OF_I95_COUNTIES } from './i95.generated';
import type { DateRange, InfoRule, Land, PublicPolicy, SeasonRule, Species, SpeciesRegs, Where } from './types';
import { WEST_COUNTIES } from './virginia';

export const SMALL_GAME_SOURCE = 'https://dwr.virginia.gov/hunting/regulations/smallgame/';

const YEAR: DateRange = ['07-01', '06-30'];
const SPRING_TURKEY: DateRange = ['04-10', '05-15'];
const SPRING_SQUIRREL: DateRange = ['06-05', '06-19'];
const NF_DWR: Land[] = ['national_forest', 'dwr'];
const PUBLIC: Land[] = ['national_forest', 'dwr', 'state_forest', 'state_park', 'army_corps', 'nps'];
const METHODS = 'Modern firearms, muzzleloaders, archery tackle, and arrowguns. Dogs may be used.';

export const SMALL_GAME_POLICY: Partial<Record<Land, PublicPolicy>> = {
  nps: { status: 'closed', note: 'Hunting is prohibited on National Park Service land.' },
  state_park: { status: 'check', always: true, note: 'Most state parks are closed to hunting or open only for special hunts — check DCR.' },
};

/** Build one species' regs from its seasons and facts. */
export function regs(species: Species, source: string, seasons: Omit<SeasonRule, 'species' | 'id'>[], info: Omit<InfoRule, 'species' | 'id'>[], extra: Partial<SpeciesRegs> = {}): SpeciesRegs {
  return {
    species,
    licenseYear: 2026,
    source,
    seasons: seasons.map((s, i) => ({ id: `${species}-${s.type}-${i + 1}`, species, dogs: s.type !== 'archery' && s.type !== 'chase', ...s })),
    eitherSex: [],
    info: info.map((x, i) => ({ id: `${species}-${x.topic}-${i + 1}`, species, ...x })),
    unlistedPublicPolicy: SMALL_GAME_POLICY,
    ...extra,
  };
}

const open = (label: string, dates: DateRange[], where: Where | Where[], notes?: string[], weekdays?: number[]) => ({
  type: 'firearms' as const,
  label,
  dates,
  where,
  take: 'any' as const,
  notes,
  weekdays,
});

const fact = (topic: InfoRule['topic'], text: string, where: InfoRule['where'] = { statewide: true }) => ({ topic, text, where });
const COMMON = [
  fact('methods', METHODS),
  fact('access', 'National Park Service land — hunting is prohibited.', { land: ['nps'] }),
  fact('access', 'Hunting in state parks is limited to designated parks, areas, and dates — check DCR before hunting.', { land: ['state_park'] }),
  fact('local', 'Cities and towns set their own weapon restrictions — check local ordinances.', [{ anyCity: true }, { anyTown: true }]),
];

// --- Squirrel ----------------------------------------------------------------
const FOX_SQUIRREL_COUNTIES = [
  ...WEST_COUNTIES,
  'Albemarle', 'Bedford', 'Culpeper', 'Fauquier', 'Franklin', 'Greene', 'Henry', 'Loudoun', 'Madison', 'Orange', 'Patrick',
  'Prince William', 'Rappahannock',
];
const SPRING_GRAY_WMAS = [
  'Amelia WMA', 'Big Survey WMA', 'Big Woods WMA', 'Briery Creek WMA', 'Cavalier WMA', 'Chickahominy WMA',
  'Clinch Mountain WMA', 'Coastal Forest WMA', 'Crooked Creek WMA', 'Dick Cross WMA', 'Doe Creek WMA',
  'Fairystone Farms WMA', 'Fairy Stone State Park', 'Philpott Reservoir', 'Featherfin WMA', 'Flippo-Gentry WMA',
  'Gathright WMA', 'Goshen WMA', 'Hardware River WMA', 'Havens WMA', 'Hidden Valley WMA', 'Highland WMA',
  'Hog Island WMA', 'Horsepen Lake WMA', 'James River WMA', 'Lake Robertson WMA', "Land's End WMA",
  'Little North Mountain WMA', 'Mattaponi WMA', 'Mattaponi Bluffs WMA', 'Merrimac Farm WMA', 'Oakley Forest WMA',
  'Pettigrew WMA', 'C.F. Phelps WMA', 'Powhatan WMA', 'Rapidan WMA', 'Short Hills WMA', 'Stewarts Creek WMA',
  'Thompson WMA', 'Robert W. Duncan WMA', 'Turkeycock Mountain WMA', 'Tye River WMA', 'Ware Creek WMA',
  'White Oak Mountain WMA',
];
const SPRING_FOX_WMAS = [
  'Big Survey WMA', 'Clinch Mountain WMA', 'Crooked Creek WMA', 'Gathright WMA', 'Goshen WMA', 'Havens WMA',
  'Hidden Valley WMA', 'Highland WMA', 'Lake Robertson WMA', 'Little North Mountain WMA', 'Merrimac Farm WMA',
  'C.F. Phelps WMA', 'Rapidan WMA', 'Short Hills WMA', 'Stewarts Creek WMA', 'Thompson WMA', 'Turkeycock Mountain WMA',
];

export const squirrel2026 = regs(
  'squirrel',
  SMALL_GAME_SOURCE,
  [
    open('Gray & red squirrel', [['09-05', '02-28']], { statewide: true }),
    open('Fox squirrel', [['09-05', '01-31']], { counties: FOX_SQUIRREL_COUNTIES }),
    open('Spring gray & red squirrel', [SPRING_SQUIRREL], {
      statewide: true,
      not: [{ land: ['national_forest'] }, { land: ['dwr'], not: [{ properties: SPRING_GRAY_WMAS }] }],
    }, ['Hog Island: Carlisle Tract only. Land’s End: Salem Church tract only. Unless otherwise posted.']),
    open('Spring fox squirrel', [SPRING_SQUIRREL], [
      { counties: FOX_SQUIRREL_COUNTIES, not: [{ land: ['national_forest'] }, { land: ['dwr'], not: [{ properties: SPRING_FOX_WMAS }] }] },
      { properties: SPRING_FOX_WMAS },
    ], ['Unless otherwise posted.']),
  ],
  [
    fact('bag', 'All squirrels combined: 6 per day.'),
    fact('access', 'The spring squirrel season (Jun 5–19) is closed on National Forest lands.', { land: ['national_forest'] }),
    ...COMMON,
  ],
);

// --- Rabbit ------------------------------------------------------------------
export const rabbit2026 = regs(
  'rabbit',
  SMALL_GAME_SOURCE,
  [open('Rabbit', [['10-31', '02-28']], { statewide: true })],
  [
    fact('bag', '6 per day.'),
    fact('methods', 'RHDV2 rules: dispose of unused rabbit parts by burial (2+ ft), incineration, or double-bagged in landfill trash; fully dress rabbits taken out of state before bringing them in. Report 3+ dead rabbits found together.'),
    ...COMMON,
  ],
);

// --- Grouse ------------------------------------------------------------------
export const grouse2026 = regs(
  'grouse',
  SMALL_GAME_SOURCE,
  [open('Grouse (west of I-95)', [['10-24', '02-13']], { counties: WEST_OF_I95_COUNTIES, cities: WEST_OF_I95_CITIES })],
  [fact('bag', '3 per day.'), fact('access', 'Grouse season is closed east of I-95.'), ...COMMON],
);

// --- Quail & pheasant --------------------------------------------------------
export const quail2026 = regs(
  'quail',
  SMALL_GAME_SOURCE,
  [
    open('Quail', [['11-07', '01-31']], {
      statewide: true,
      not: [{ region: 'west', land: PUBLIC }, { properties: ['Flippo-Gentry WMA'] }],
    }),
  ],
  [
    fact('bag', '6 per day.'),
    fact('access', 'Quail season is closed on all public lands west of the Blue Ridge and on Flippo-Gentry WMA.'),
    fact('methods', 'Pen-raised birds may be taken on licensed hunting preserves Sep 1 – Apr 30, including Sundays.'),
    ...COMMON,
  ],
);

export const pheasant2026 = regs(
  'pheasant',
  SMALL_GAME_SOURCE,
  [open('Pheasant', [['11-07', '01-31']], { statewide: true })],
  [
    fact('bag', 'No daily or seasonal bag limit.'),
    fact('methods', 'Pen-raised birds may be taken on licensed hunting preserves Sep 1 – Apr 30, including Sundays.'),
    ...COMMON,
  ],
);

// --- Crow (Mon, Wed, Fri, Sat) ------------------------------------------------
const MWFS = [1, 3, 5, 6];
export const crow2026 = regs(
  'crow',
  SMALL_GAME_SOURCE,
  [
    open('Crow (Mon, Wed, Fri, Sat)', [['08-15', '03-19']], { statewide: true, not: [{ land: NF_DWR }] }, undefined, MWFS),
    open('Crow on National Forest & DWR lands (Mon, Wed, Fri, Sat)', [['09-02', '03-10']], { land: NF_DWR }, undefined, MWFS),
  ],
  [
    fact('methods', 'Federally regulated, but no HIP registration needed; unplugged shotguns allowed. Electronic calls allowed (landowner permission needed only on posted land).'),
    ...COMMON,
  ],
);

// --- Groundhog ---------------------------------------------------------------
export const groundhog2026 = regs(
  'groundhog',
  SMALL_GAME_SOURCE,
  [
    open('Groundhog (continuous)', [YEAR], { statewide: true, not: [{ land: NF_DWR }] }),
    open('Groundhog on National Forest & DWR lands', [['09-01', '03-10'], SPRING_TURKEY], { land: NF_DWR }),
    open('Groundhog on DWR lands (spring squirrel season)', [SPRING_SQUIRREL], { land: ['dwr'], properties: SPRING_GRAY_WMAS }, [
      'Only on DWR lands open for spring squirrel hunting.',
    ]),
  ],
  [...COMMON],
);

export const SMALL_GAME = [squirrel2026, rabbit2026, grouse2026, quail2026, pheasant2026, crow2026, groundhog2026];
