/**
 * Elk rules for a license year, derived from that year's deer rules.
 *
 * Outside the Elk Management Zone (Buchanan, Dickenson, Wise), any elk may be
 * taken on any day of an open deer season with that season's deer weapons.
 * Inside the zone, only lottery license holders may hunt, during the managed hunt.
 */
import type { DateRange, InfoRule, SeasonRule, Selector, SpeciesRegs, Where } from './types';

const EMZ = ['Buchanan', 'Dickenson', 'Wise'];
const NOT_EMZ: Where = { counties: EMZ };

const outsideEmz = (sel: Selector): Selector =>
  (Array.isArray(sel) ? sel : [sel]).map((w) => ({ ...w, not: [...(w.not ?? []), NOT_EMZ] }));

export interface ElkYear {
  /** The managed (lottery) hunt in the Elk Management Zone. */
  lottery: DateRange;
  lotteryLabel: string;
  lotteryNotes: string[];
  source: string;
}

export function deriveElk(deer: SpeciesRegs, year: ElkYear): SpeciesRegs {
  const fromDeer: SeasonRule[] = deer.seasons.map((s) => ({
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
    dates: [year.lottery],
    where: { counties: EMZ },
    take: 'quota',
    notes: year.lotteryNotes,
    ref: 'elk-lottery',
  };

  const info = (id: string, topic: InfoRule['topic'], where: InfoRule['where'], text: string): InfoRule => ({
    id: `elk-${id}`,
    species: 'elk',
    topic,
    where,
    text,
  });

  return {
    ...deer,
    species: 'elk',
    source: year.source,
    seasons: [...fromDeer, lottery],
    eitherSex: [],
    info: [
      info('bag', 'bag', { statewide: true, not: [NOT_EMZ] },
        '1 elk per day. An elk counts toward your deer bag: antlered = your either-sex (buck) limit, antlerless = your antlerless limit. Not on DCAP, DMAP, or DPOP tags.'),
      info('methods', 'methods', { statewide: true, not: [NOT_EMZ] },
        'Use the weapons legal for deer in that season — rifles/pistols .23 caliber or larger, shotguns, muzzleloading rifles .40 caliber or larger, archery — except no slingbows or air guns.'),
      info('report', 'methods', { statewide: true },
        'Report like a deer (as an elk), then call DWR at (804) 367-0044 to arrange biological sampling. Keep evidence of sex until reported.'),
      info('emz', 'access', { counties: EMZ },
        `Elk Management Zone: elk may only be taken by special elk license holders during the managed hunt (${year.lotteryLabel}). Deer hunters here may not take elk.`),
      info('access-nps', 'access', { land: ['nps'] }, 'National Park Service land — hunting is prohibited.'),
    ],
  };
}
