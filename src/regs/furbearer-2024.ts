/**
 * Virginia furbearer hunting regulations, 2024-25 license year.
 * Source: 2024–2025 Hunting & Trapping in Virginia digest, pp. 50–52
 *   https://dwr.virginia.gov/wp-content/uploads/media/2024-2025-Virginia-Hunting-and-Trapping-Regulations-Digest.pdf
 *   sha256 5174144546ede3b1249c77ba8fff93c0c22600ffaf95aad70d35594924d7bdda
 *
 * Fisher and spotted skunk: continuous closed season (no map entry).
 */
import { regs } from './small-game-2026';
import type { DateRange, DogRule, InfoRule, Land, SeasonRule, SpeciesRegs, Where } from './types';

const SOURCE = 'https://dwr.virginia.gov/wp-content/uploads/media/2024-2025-Virginia-Hunting-and-Trapping-Regulations-Digest.pdf';
const Y2024: Partial<SpeciesRegs> = { licenseYear: 2024 };
const YEAR: DateRange = ['07-01', '06-30'];
/** Spring turkey season 2025 (p. 47). */
const SPRING_TURKEY: DateRange = ['04-12', '05-17'];
/** Spring squirrel season 2025 (p. 48). */
const SPRING_SQUIRREL: DateRange = ['06-07', '06-21'];
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

/** Species open year-round except on National Forest and DWR lands (coyote, striped skunk), p. 50, 52. */
const continuousExceptPublic = (name: string): S[] => [
  firearms(`${name} (continuous)`, [YEAR], { statewide: true, not: [{ land: NF_DWR }] }),
  firearms(`${name} on National Forest & DWR lands`, [['09-01', '03-10'], SPRING_TURKEY], { land: NF_DWR }),
  firearms(`${name} on DWR lands (spring squirrel season)`, [SPRING_SQUIRREL], { land: ['dwr'] }, ['Unless otherwise posted.']),
];

// --- Bobcat (p. 50) ----------------------------------------------------------
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

export const bobcat2024 = regs(
  'bobcat',
  SOURCE,
  [
    { type: 'archery', label: 'Bobcat archery', dates: [['10-05', '10-31']], where: { statewide: true }, take: 'any', notes: ['No dogs and no firearms while bowhunting bobcat.'] },
    firearms('Bobcat firearms', [['11-01', '02-28']], { statewide: true }),
  ],
  [
    fact('bag', '2 per hunting party between noon one day and noon the next.'),
    fact('methods', 'Report every bobcat within 24 hours (phone 866-468-4263 or online). Pelts sold or shipped out of state need a CITES tag (by April 1).'),
    CALLS,
    ...COMMON,
  ],
  { ...Y2024, dogRules: [BOBCAT_NO_DOGS] },
);

// --- Coyote (p. 50) ----------------------------------------------------------
export const coyote2024 = regs('coyote', SOURCE, continuousExceptPublic('Coyote'), [
  fact('methods', 'Counties may run their own coyote bounty programs (not DWR) — ask the county administrator.'),
  CALLS,
  ...COMMON,
], Y2024);

// --- Fox (pp. 51–52) ------------------------------------------------------------
const FOX_CLOSED = ['Albemarle', 'Clarke', 'Culpeper', 'Fauquier', 'Loudoun', 'Louisa', 'Rappahannock'];
const FOX_WMAS = ['Gathright WMA', 'Goshen WMA', 'Highland WMA', 'Little North Mountain WMA'];

export const fox2024 = regs(
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
    fact('bag', 'Gray fox: 1 per hunting party between noon one day and noon the next. Report gray foxes (see digest p. 27).'),
    fact('access', 'Fox firearms seasons are closed in this county (Fauquier: except Quantico).', { counties: FOX_CLOSED }),
    CALLS,
    ...COMMON,
  ],
  {
    ...Y2024,
    dogRules: [
      {
        where: [{ land: ['national_forest'] }, { properties: FOX_WMAS }],
        duringDeerFirearms: true,
        note: 'No dogs for fox here during the deer firearms season.',
      },
    ],
  },
);

// --- Raccoon (p. 52) -----------------------------------------------------------
export const raccoon2024 = regs(
  'raccoon',
  SOURCE,
  [
    firearms('Raccoon', [['10-15', '03-10']], { statewide: true }),
    chase('Raccoon chase (no take)', [YEAR], { statewide: true, not: [{ land: ['national_forest'] }, { land: ['dwr'], region: 'west' }] }, [
      'No raccoon may be taken except in the firearms season. Including Sundays. No firearms, bows, axes, saws, or climbing devices while chasing.',
    ]),
    chase('Raccoon chase (no take)', [['08-01', '09-28']], [{ land: ['national_forest'] }, { land: ['dwr'], region: 'west' }], [
      'Here only where bear hound training is permitted, Aug 1 – Sep 28.',
    ]),
  ],
  [
    fact('bag', '2 per hunter between noon one day and noon the next (east of the Blue Ridge).', { region: 'east' }),
    fact('bag', '2 per hunting party between noon one day and noon the next (west of the Blue Ridge).', { region: 'west' }),
    CALLS,
    ...COMMON,
  ],
  Y2024,
);

// --- Opossum & skunk (p. 52) -----------------------------------------------------
export const opossum2024 = regs('opossum', SOURCE, [firearms('Opossum', [['10-15', '03-10']], { statewide: true })], [...COMMON], Y2024);

export const skunk2024 = regs('skunk', SOURCE, continuousExceptPublic('Striped skunk'), [
  fact('access', 'Spotted skunks: continuous closed season (and their pelts may not be sold).'),
  ...COMMON,
], Y2024);

export const FURBEARERS_2024 = [bobcat2024, coyote2024, fox2024, raccoon2024, opossum2024, skunk2024];
