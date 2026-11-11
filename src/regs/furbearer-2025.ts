/**
 * Virginia furbearer hunting regulations, 2025-26 license year.
 * Source: 2025–2026 Virginia Hunting & Trapping Regulations digest, pp. 52–54 (PDF pages; printed pp. 50–52),
 *   https://www.eregulations.com/assets/docs/guides/25VAHD_LR.pdf
 *   sha256 19e03a913e95ac37bef013418087802de23e8726d6c321c82d6c2390b65c7075
 * cross-checked with sources/regs/2025-26/eregulations/furbearer-hunting.html.
 *
 * Fisher and spotted skunk: continuous closed season (no map entry).
 * (The new 2025-26 continuous opossum/raccoon season on private land with the
 * landowner's permission is a trapping season, not encoded here.)
 */
import { SPRING_SQUIRREL_2025, SPRING_TURKEY_2025 } from './small-game-2025';
import { regs } from './small-game-2026';
import type { DateRange, DogRule, InfoRule, Land, SeasonRule, Where } from './types';

const SOURCE = 'https://www.eregulations.com/assets/docs/guides/25VAHD_LR.pdf';
const Y2025 = { licenseYear: 2025 };
const YEAR: DateRange = ['07-01', '06-30'];
const NF_DWR: Land[] = ['national_forest', 'dwr'];

type S = Omit<SeasonRule, 'species' | 'id'>;
const firearms = (label: string, dates: DateRange[], where: Where | Where[], notes?: string[]): S => ({
  type: 'firearms', label, dates, where, take: 'any', notes,
});
const chase = (label: string, dates: DateRange[], where: Where | Where[], notes?: string[]): S => ({
  type: 'chase', label, dates, where, take: 'none', notes,
});
const fact = (topic: InfoRule['topic'], text: string, where: InfoRule['where'] = { statewide: true }) => ({ topic, text, where });

const COMMON = [
  fact('methods', 'Modern firearms, muzzleloaders, archery tackle, and arrowguns. Hunting is permitted day or night; lights may be used if not attached to or cast from a vehicle; night-vision scopes and laser sights allowed.'),
  fact('access', 'National Park Service land — hunting is prohibited.', { land: ['nps'] }),
  fact('access', 'Hunting in state parks is limited to designated parks, areas, and dates — check DCR before hunting.', { land: ['state_park'] }),
  fact('local', 'Cities and towns set their own weapon restrictions — check local ordinances.', [{ anyCity: true }, { anyTown: true }]),
];
const CALLS = fact('methods', 'Electronic calls allowed for bobcat, coyote, fox, and raccoon (written landowner permission on private land; on public land unless prohibited).');

/** Seasons for species open year-round except on National Forest and DWR lands (coyote, skunk) (pp. 52, 54). */
const continuousExceptPublic = (name: string): S[] => [
  firearms(`${name} (continuous)`, [YEAR], { statewide: true, not: [{ land: NF_DWR }] }),
  firearms(`${name} on National Forest & DWR lands`, [['09-01', '03-10'], SPRING_TURKEY_2025], { land: NF_DWR }),
  firearms(`${name} on DWR lands (spring squirrel season)`, [SPRING_SQUIRREL_2025], { land: ['dwr'] }, ['Unless otherwise posted.']),
];

// --- Bobcat (p. 52) -------------------------------------------------------------
const BOBCAT_NO_DOGS: DogRule = {
  where: [
    {
      counties: [
        'Alleghany', 'Amherst/west', 'Augusta', 'Bath', 'Bedford', 'Botetourt', 'Campbell/west', 'Clarke', 'Frederick',
        'Highland', 'Nelson/west', 'Page', 'Pittsylvania/west', 'Rockbridge', 'Rockingham', 'Shenandoah', 'Warren',
      ],
    },
    { land: ['national_forest'] },
  ],
  duringDeerFirearms: true,
  note: 'No dogs for bobcat here during the deer firearms season.',
};

export const bobcat2025 = regs(
  'bobcat',
  SOURCE,
  [
    { type: 'archery', label: 'Bobcat archery', dates: [['10-04', '10-31']], where: { statewide: true }, take: 'any', notes: ['No dogs and no firearms while bowhunting bobcat.'] },
    firearms('Bobcat firearms', [['11-01', '02-28']], { statewide: true }),
  ],
  [
    fact('bag', '2 per hunting party between noon one day and noon the next.'),
    fact('methods', 'Report every bobcat within 24 hours (phone 866-468-4263 or online). Pelts sold or shipped out of state need a CITES tag (by April 1).'),
    CALLS,
    ...COMMON,
  ],
  { ...Y2025, dogRules: [BOBCAT_NO_DOGS] },
);

// --- Coyote (p. 52) -------------------------------------------------------------
export const coyote2025 = regs('coyote', SOURCE, continuousExceptPublic('Coyote'), [
  fact('methods', 'Counties may run their own coyote bounty programs (not DWR) — ask the county administrator.'),
  CALLS,
  ...COMMON,
], Y2025);

// --- Fox (p. 54) ----------------------------------------------------------------
const FOX_CLOSED = ['Albemarle', 'Clarke', 'Culpeper', 'Fauquier', 'Loudoun', 'Louisa', 'Rappahannock'];
const FOX_WMAS = ['Gathright WMA', 'Goshen WMA', 'Highland WMA', 'Little North Mountain WMA'];

export const fox2025 = regs(
  'fox',
  SOURCE,
  [
    firearms('Red fox', [['11-01', '02-28']], { statewide: true, not: [{ counties: FOX_CLOSED }] }),
    firearms('Gray fox', [['01-01', '02-28']], { statewide: true, not: [{ counties: FOX_CLOSED }] }),
    chase('Fox chase (no take)', [YEAR], { statewide: true, not: [{ land: ['national_forest'] }, { properties: [...FOX_WMAS, 'Thompson WMA', 'Rapidan WMA'] }] }, [
      'No fox may be taken except in the firearms season. Including Sundays.',
    ]),
    chase('Fox chase (no take)', [['11-01', '02-28']], [{ land: ['national_forest'] }, { properties: FOX_WMAS }], [
      'Closed Mar 1 – Oct 31 and during the deer firearms season here.',
    ]),
    chase('Fox chase (no take)', [['11-01', '02-28']], { properties: ['Thompson WMA', 'Rapidan WMA'] }, ['Closed Mar 1 – Oct 31 here.']),
  ],
  [
    fact('bag', 'Gray fox: 1 per hunting party between noon one day and noon the next. Report gray foxes within 24 hours.'),
    fact('access', 'Fox firearms seasons are closed in this county (Fauquier: except Quantico).', { counties: FOX_CLOSED }),
    CALLS,
    ...COMMON,
  ],
  {
    ...Y2025,
    dogRules: [
      {
        where: [{ land: ['national_forest'] }, { properties: FOX_WMAS }],
        duringDeerFirearms: true,
        note: 'No dogs for fox here during the deer firearms season.',
      },
    ],
  },
);

// --- Raccoon (p. 54) ------------------------------------------------------------
export const raccoon2025 = regs(
  'raccoon',
  SOURCE,
  [
    firearms('Raccoon', [['10-15', '03-10']], { statewide: true }),
    chase('Raccoon chase (no take)', [YEAR], { statewide: true, not: [{ land: ['national_forest'] }, { land: ['dwr'], region: 'west' }] }, [
      'No raccoon may be taken except in the firearms season. Including Sundays. No firearms, bows, axes, saws, or climbing devices while chasing.',
    ]),
    chase('Raccoon chase (no take)', [['08-01', '09-27']], [{ land: ['national_forest'] }, { land: ['dwr'], region: 'west' }], [
      'Here only where bears may be chased, Aug 1 – Sep 27.',
    ]),
  ],
  [
    fact('bag', '2 per hunter between noon one day and noon the next (east of the Blue Ridge).', { region: 'east' }),
    fact('bag', '2 per hunting party between noon one day and noon the next (west of the Blue Ridge).', { region: 'west' }),
    CALLS,
    ...COMMON,
  ],
  Y2025,
);

// --- Opossum & skunk (p. 54) ----------------------------------------------------
export const opossum2025 = regs('opossum', SOURCE, [firearms('Opossum', [['10-15', '03-10']], { statewide: true })], [...COMMON], Y2025);

export const skunk2025 = regs('skunk', SOURCE, continuousExceptPublic('Striped skunk'), [
  fact('access', 'Spotted skunks: continuous closed season (and their pelts may not be sold).'),
  ...COMMON,
], Y2025);

export const FURBEARERS_2025 = [bobcat2025, coyote2025, fox2025, raccoon2025, opossum2025, skunk2025];
