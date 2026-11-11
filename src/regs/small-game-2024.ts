/**
 * Virginia small game regulations, 2024-25 license year.
 * Source: 2024–2025 Hunting & Trapping in Virginia digest, pp. 48–49
 *   https://dwr.virginia.gov/wp-content/uploads/media/2024-2025-Virginia-Hunting-and-Trapping-Regulations-Digest.pdf
 *   sha256 5174144546ede3b1249c77ba8fff93c0c22600ffaf95aad70d35594924d7bdda
 */
import { WEST_OF_I95_CITIES, WEST_OF_I95_COUNTIES } from './i95.generated';
import { regs } from './small-game-2026';
import type { DateRange, InfoRule, Land, SeasonRule, SpeciesRegs, Where } from './types';
import { WEST_COUNTIES } from './virginia';

export const SMALL_GAME_2024_SOURCE = 'https://dwr.virginia.gov/wp-content/uploads/media/2024-2025-Virginia-Hunting-and-Trapping-Regulations-Digest.pdf';
const Y2024: Partial<SpeciesRegs> = { licenseYear: 2024 };

const YEAR: DateRange = ['07-01', '06-30'];
/** Spring turkey season 2025 (p. 47): Apr 12 – May 17. */
const SPRING_TURKEY: DateRange = ['04-12', '05-17'];
/** Spring squirrel season 2025 (p. 48): Jun 7 – 21. */
const SPRING_SQUIRREL: DateRange = ['06-07', '06-21'];
const NF_DWR: Land[] = ['national_forest', 'dwr'];
const PUBLIC: Land[] = ['national_forest', 'dwr', 'state_forest', 'state_park', 'army_corps', 'nps'];
const METHODS = 'Modern firearms, muzzleloaders, archery tackle, and arrowguns. Dogs may be used.';

const open = (label: string, dates: DateRange[], where: Where | Where[], notes?: string[], weekdays?: number[]): Omit<SeasonRule, 'species' | 'id'> => ({
  type: 'firearms',
  label,
  dates,
  where,
  take: 'any',
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

// --- Squirrel (p. 48) --------------------------------------------------------
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

export const squirrel2024 = regs(
  'squirrel',
  SMALL_GAME_2024_SOURCE,
  [
    open('Gray & red squirrel', [['09-07', '02-28']], { statewide: true }),
    open('Fox squirrel', [['09-07', '01-31']], { counties: FOX_SQUIRREL_COUNTIES }),
    open('Spring gray & red squirrel', [SPRING_SQUIRREL], {
      statewide: true,
      not: [{ land: ['national_forest'] }, { land: ['dwr'], not: [{ properties: SPRING_GRAY_WMAS }] }],
    }, ['Hog Island: Carlisle Tract only. Land’s End: Salem Church tract only. Powhatan WMA includes the Goochland Tract. Unless otherwise posted.']),
    open('Spring fox squirrel', [SPRING_SQUIRREL], [
      { counties: FOX_SQUIRREL_COUNTIES, not: [{ land: ['national_forest'] }, { land: ['dwr'], not: [{ properties: SPRING_FOX_WMAS }] }] },
      { properties: SPRING_FOX_WMAS },
    ], ['Unless otherwise posted.']),
  ],
  [
    fact('bag', 'All squirrels combined: 6 per day.'),
    fact('access', 'The spring squirrel season (Jun 7–21, 2025) is closed on National Forest lands.', { land: ['national_forest'] }),
    ...COMMON,
  ],
  Y2024,
);

// --- Rabbit (pp. 48–49) ------------------------------------------------------
export const rabbit2024 = regs(
  'rabbit',
  SMALL_GAME_2024_SOURCE,
  [open('Rabbit', [['11-02', '02-28']], { statewide: true })],
  [
    fact('bag', '6 per day.'),
    fact('methods', 'RHDV2 rules: dispose of unused rabbit parts by burial (2+ ft), incineration, or double-bagged in trash; fully dress rabbits taken out of state before bringing them in. Report multiple dead rabbits found together.'),
    ...COMMON,
  ],
  Y2024,
);

// --- Grouse (p. 48) ----------------------------------------------------------
export const grouse2024 = regs(
  'grouse',
  SMALL_GAME_2024_SOURCE,
  [open('Grouse (west of I-95)', [['10-26', '02-08']], { counties: WEST_OF_I95_COUNTIES, cities: WEST_OF_I95_CITIES })],
  [fact('bag', '3 per day.'), fact('access', 'Grouse season is closed east of I-95.'), ...COMMON],
  Y2024,
);

// --- Quail & pheasant (p. 48) -----------------------------------------------
export const quail2024 = regs(
  'quail',
  SMALL_GAME_2024_SOURCE,
  [
    open('Quail', [['11-09', '01-31']], {
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
  Y2024,
);

export const pheasant2024 = regs(
  'pheasant',
  SMALL_GAME_2024_SOURCE,
  [open('Pheasant', [['11-09', '01-31']], { statewide: true })],
  [
    fact('bag', 'No daily or seasonal bag limit.'),
    fact('methods', 'Pen-raised birds may be taken on licensed hunting preserves Sep 1 – Apr 30, including Sundays.'),
    ...COMMON,
  ],
  Y2024,
);

// --- Crow (Mon, Wed, Fri, Sat) (p. 48) ----------------------------------------
const MWFS = [1, 3, 5, 6];
export const crow2024 = regs(
  'crow',
  SMALL_GAME_2024_SOURCE,
  [
    open('Crow (Mon, Wed, Fri, Sat)', [['08-17', '03-21']], { statewide: true, not: [{ land: NF_DWR }] }, undefined, MWFS),
    open('Crow on National Forest & DWR lands (Mon, Wed, Fri, Sat)', [['09-02', '03-10']], { land: NF_DWR }, undefined, MWFS),
  ],
  [
    fact('methods', 'Federally regulated, but no HIP registration needed; unplugged shotguns allowed. Electronic calls allowed (landowner permission needed only on posted land).'),
    ...COMMON,
  ],
  Y2024,
);

// --- Groundhog (p. 48) ---------------------------------------------------------
export const groundhog2024 = regs(
  'groundhog',
  SMALL_GAME_2024_SOURCE,
  [
    open('Groundhog (continuous)', [YEAR], { statewide: true, not: [{ land: NF_DWR }] }),
    open('Groundhog on National Forest & DWR lands', [['09-01', '03-10'], SPRING_TURKEY], { land: NF_DWR }),
    open('Groundhog on DWR lands (spring squirrel season)', [SPRING_SQUIRREL], { land: ['dwr'], properties: SPRING_GRAY_WMAS }, [
      'Only on DWR lands open for spring squirrel hunting.',
    ]),
  ],
  [...COMMON],
  Y2024,
);

export const SMALL_GAME_2024 = [squirrel2024, rabbit2024, grouse2024, quail2024, pheasant2024, crow2024, groundhog2024];
