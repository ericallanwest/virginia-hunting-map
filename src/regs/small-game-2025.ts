/**
 * Virginia small game regulations, 2025-26 license year.
 * Source: 2025–2026 Virginia Hunting & Trapping Regulations digest, p. 50–51 (PDF pages; printed pp. 48–49),
 *   https://www.eregulations.com/assets/docs/guides/25VAHD_LR.pdf
 *   sha256 19e03a913e95ac37bef013418087802de23e8726d6c321c82d6c2390b65c7075
 * cross-checked with sources/regs/2025-26/eregulations/small-game-hunting.html.
 */
import { WEST_OF_I95_CITIES, WEST_OF_I95_COUNTIES } from './i95.generated';
import { regs } from './small-game-2026';
import type { DateRange, InfoRule, Land, SpeciesRegs, Where } from './types';
import { WEST_COUNTIES } from './virginia';

export const SMALL_GAME_2025_SOURCE = 'https://www.eregulations.com/assets/docs/guides/25VAHD_LR.pdf';
const Y2025: Partial<SpeciesRegs> = { licenseYear: 2025 };

const YEAR: DateRange = ['07-01', '06-30'];
/** Spring turkey season 2026 (Apr 11 – May 16), p. 49. */
export const SPRING_TURKEY_2025: DateRange = ['04-11', '05-16'];
/** Spring squirrel season, Jun 6–20, 2026 (p. 50). */
export const SPRING_SQUIRREL_2025: DateRange = ['06-06', '06-20'];
const NF_DWR: Land[] = ['national_forest', 'dwr'];
const PUBLIC: Land[] = ['national_forest', 'dwr', 'state_forest', 'state_park', 'army_corps', 'nps'];
const METHODS = 'Modern firearms, muzzleloaders, archery tackle, and arrowguns. Dogs may be used.';

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

// --- Squirrel (p. 50) -----------------------------------------------------------
const FOX_SQUIRREL_COUNTIES = [
  ...WEST_COUNTIES,
  'Albemarle', 'Bedford', 'Culpeper', 'Fauquier', 'Franklin', 'Greene', 'Henry', 'Loudoun', 'Madison', 'Orange', 'Patrick',
  'Prince William', 'Rappahannock',
];
/** WMAs open for spring gray & red squirrel (names as in public-lands.geojson). */
export const SPRING_GRAY_WMAS_2025 = [
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

export const squirrel2025 = regs(
  'squirrel',
  SMALL_GAME_2025_SOURCE,
  [
    open('Gray & red squirrel', [['09-06', '02-28']], { statewide: true }),
    open('Fox squirrel', [['09-06', '01-31']], { counties: FOX_SQUIRREL_COUNTIES }),
    open('Spring gray & red squirrel', [SPRING_SQUIRREL_2025], {
      statewide: true,
      not: [{ land: ['national_forest'] }, { land: ['dwr'], not: [{ properties: SPRING_GRAY_WMAS_2025 }] }],
    }, ['Hog Island: Carlisle Tract only. Land’s End: Salem Church tract only. Powhatan WMA includes the Goochland Tract. Unless otherwise posted.']),
    open('Spring fox squirrel', [SPRING_SQUIRREL_2025], [
      { counties: FOX_SQUIRREL_COUNTIES, not: [{ land: ['national_forest'] }, { land: ['dwr'], not: [{ properties: SPRING_FOX_WMAS }] }] },
      { properties: SPRING_FOX_WMAS },
    ], ['Unless otherwise posted.']),
  ],
  [
    fact('bag', 'All squirrels combined: 6 per day.'),
    fact('access', 'The spring squirrel season (Jun 6–20, 2026) is closed on National Forest lands.', { land: ['national_forest'] }),
    ...COMMON,
  ],
  Y2025,
);

// --- Rabbit (p. 50) -------------------------------------------------------------
export const rabbit2025 = regs(
  'rabbit',
  SMALL_GAME_2025_SOURCE,
  [open('Rabbit', [['11-01', '02-28']], { statewide: true })],
  [
    fact('bag', '6 per day.'),
    fact('methods', 'RHDV2 rules: dispose of unused rabbit parts by burial (2+ ft), incineration, or double-bagged in landfill trash; fully dress rabbits taken out of state before bringing them in. Report 3+ dead rabbits found together.'),
    ...COMMON,
  ],
  Y2025,
);

// --- Grouse (p. 50) -------------------------------------------------------------
export const grouse2025 = regs(
  'grouse',
  SMALL_GAME_2025_SOURCE,
  [open('Grouse (west of I-95)', [['10-25', '02-14']], { counties: WEST_OF_I95_COUNTIES, cities: WEST_OF_I95_CITIES })],
  [fact('bag', '3 per day.'), fact('access', 'Grouse season is closed east of I-95.'), ...COMMON],
  Y2025,
);

// --- Quail & pheasant (p. 50) ---------------------------------------------------
export const quail2025 = regs(
  'quail',
  SMALL_GAME_2025_SOURCE,
  [
    open('Quail', [['11-08', '01-31']], {
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
  Y2025,
);

export const pheasant2025 = regs(
  'pheasant',
  SMALL_GAME_2025_SOURCE,
  [open('Pheasant', [['11-08', '01-31']], { statewide: true })],
  [
    fact('bag', 'No daily or seasonal bag limit.'),
    fact('methods', 'Pen-raised birds may be taken on licensed hunting preserves Sep 1 – Apr 30, including Sundays.'),
    ...COMMON,
  ],
  Y2025,
);

// --- Crow (Mon, Wed, Fri, Sat) (p. 50) ------------------------------------------
const MWFS = [1, 3, 5, 6];
export const crow2025 = regs(
  'crow',
  SMALL_GAME_2025_SOURCE,
  [
    open('Crow (Mon, Wed, Fri, Sat)', [['08-16', '03-20']], { statewide: true, not: [{ land: NF_DWR }] }, undefined, MWFS),
    open('Crow on National Forest & DWR lands (Mon, Wed, Fri, Sat)', [['09-01', '03-09']], { land: NF_DWR }, undefined, MWFS),
  ],
  [
    fact('methods', 'Federally regulated, but no HIP registration needed; unplugged shotguns allowed. Electronic calls allowed (landowner permission needed only on posted land).'),
    ...COMMON,
  ],
  Y2025,
);

// --- Groundhog (p. 50) ----------------------------------------------------------
export const groundhog2025 = regs(
  'groundhog',
  SMALL_GAME_2025_SOURCE,
  [
    open('Groundhog (continuous)', [YEAR], { statewide: true, not: [{ land: NF_DWR }] }),
    open('Groundhog on National Forest & DWR lands', [['09-01', '03-10'], SPRING_TURKEY_2025], { land: NF_DWR }),
    open('Groundhog on DWR lands (spring squirrel season)', [SPRING_SQUIRREL_2025], { land: ['dwr'], properties: SPRING_GRAY_WMAS_2025 }, [
      'Only on DWR lands open for spring squirrel hunting.',
    ]),
  ],
  [...COMMON],
  Y2025,
);

export const SMALL_GAME_2025 = [squirrel2025, rabbit2025, grouse2025, quail2025, pheasant2025, crow2025, groundhog2025];
