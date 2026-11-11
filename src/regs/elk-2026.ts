/**
 * Virginia elk regulations, 2026-27 license year.
 * Sources: https://dwr.virginia.gov/wildlife/elk/hunting/ and .../elk-hunting/elk-lottery/
 *          (snapshots in sources/regs/elk-hunting.html, elk-lottery.html)
 *
 * Outside the Elk Management Zone (Buchanan, Dickenson, Wise), any elk may be
 * taken on any day of an open deer season with that season's deer weapons, so
 * those rules are derived from the deer rules. Inside the zone, elk may only be
 * taken by lottery license holders during the managed hunt (antlered bulls only).
 */
import { deer2026 } from './deer-2026';
import type { InfoRule, SeasonRule, Selector, SpeciesRegs, Where } from './types';

const EMZ = ['Buchanan', 'Dickenson', 'Wise'];
const NOT_EMZ: Where = { counties: EMZ };

const outsideEmz = (sel: Selector): Selector =>
  (Array.isArray(sel) ? sel : [sel]).map((w) => ({ ...w, not: [...(w.not ?? []), NOT_EMZ] }));

const fromDeer: SeasonRule[] = deer2026.seasons.map((s) => ({
  ...s,
  id: s.id.replace(/^deer/, 'elk'),
  species: 'elk',
  where: outsideEmz(s.where),
  // Any elk (bull, cow, or calf) on any day of an open deer season.
  take: s.take === 'quota' ? 'quota' : 'any',
  eitherSexDays: undefined,
  esGroup: undefined,
  notes: s.youthOnly ? s.notes : undefined,
}));

const lottery: SeasonRule = {
  id: 'elk-emz-lottery',
  species: 'elk',
  type: 'firearms',
  label: 'Elk Management Zone hunt (lottery license only)',
  dates: [['10-10', '10-16']],
  where: { counties: EMZ },
  take: 'quota',
  notes: [
    'Only holders of a special elk license (5 by lottery + 1 conservation license). Antlered bulls only; 1 elk per license year.',
    'Lottery applications open each February–March.',
  ],
  ref: 'elk-lottery',
};

const info = (id: string, topic: InfoRule['topic'], where: InfoRule['where'], text: string): InfoRule => ({
  id: `elk-${id}`,
  species: 'elk',
  topic,
  where,
  text,
});

const infos: InfoRule[] = [
  info('bag', 'bag', { statewide: true, not: [NOT_EMZ] },
    '1 elk per day. An elk counts toward your deer bag: antlered = your either-sex (buck) limit, antlerless = your antlerless limit. Not on DCAP, DMAP, or DPOP tags.'),
  info('methods', 'methods', { statewide: true, not: [NOT_EMZ] },
    'Use the weapons legal for deer in that season — rifles/pistols .23 caliber or larger, shotguns, muzzleloading rifles .40 caliber or larger, archery — except no slingbows or air guns.'),
  info('report', 'methods', { statewide: true },
    'Report like a deer (as an elk), then call DWR at (804) 367-0044 to arrange biological sampling. Keep evidence of sex until reported.'),
  info('emz', 'access', { counties: EMZ },
    'Elk Management Zone: elk may only be taken by special elk license holders during the managed hunt (Oct 10–16, 2026). Deer hunters here may not take elk.'),
  info('access-nps', 'access', { land: ['nps'] }, 'National Park Service land — hunting is prohibited.'),
];

export const elk2026: SpeciesRegs = {
  ...deer2026,
  species: 'elk',
  source: 'https://dwr.virginia.gov/wildlife/elk/hunting/',
  seasons: [...fromDeer, lottery],
  eitherSex: [],
  info: infos,
};
