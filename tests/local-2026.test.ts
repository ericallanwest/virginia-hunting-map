import { describe, expect, it } from 'vitest';
import { bear2026 as bear } from '../src/regs/bear-2026';
import { deer2026 as deer } from '../src/regs/deer-2026';
import { elk2026 as elk } from '../src/regs/elk-2026';
import { evaluate } from '../src/regs/engine';
import { LOCAL, localConflicts } from '../src/regs/local';
import { LOCAL_EFFECTS } from '../src/regs/local-effects';
import { turkey2026 as turkey } from '../src/regs/turkey-2026';
import type { Place, SpeciesRegs } from '../src/regs/types';
import { regionOf } from '../src/regs/virginia';

const place = (p: Partial<Place>): Place => ({ land: 'private', region: regionOf(p.county, p.city), ...p });
const weapons = (regs: SpeciesRegs, p: Partial<Place>, iso: string) =>
  evaluate(regs, place(p), iso).open.map((o) => `${o.rule.type}:${o.weapon}`).sort();

describe('local ordinance data', () => {
  it('covers every DWR locality page', () => expect(LOCAL.length).toBe(101));
  it('every reviewed effect cites a section that appears in the extracted ordinances', () => {
    // 'Sec. 17-5', 'Section 6-1-2(d), (e)', '§ 54-7' -> '17-5', '6-1-2', '54-7'
    const key = (sec: string) => sec.replace(/^(Sec\.?|Section|§)\s*/, '').split(/[,(]/)[0].trim();
    const missing = LOCAL_EFFECTS.filter((e) => {
      const ord = LOCAL.find((l) => l.jurisdiction === e.jurisdiction);
      return !ord?.restrictions.some((r) => r.section.includes(key(e.section)));
    });
    expect(missing.map((e) => `${e.jurisdiction} ${e.section}`)).toEqual([]);
  });
});

describe('local ordinances narrow the weapons', () => {
  it('Arlington: muzzleloader and firearms seasons are archery-only (Sec. 17-5 bans all firearm discharge)', () => {
    expect(weapons(deer, { county: 'Arlington' }, '2026-11-05')).toEqual(['archery:archery', 'muzzleloader:archery']);
    expect(weapons(deer, { county: 'Arlington' }, '2026-11-20')).toEqual(['firearms:archery']);
    expect(evaluate(deer, place({ county: 'Arlington' }), '2026-11-20').summary.weapon).toBe('archery');
  });
  it('Falls Church: no hunting at all', () => {
    expect(evaluate(deer, place({ city: 'Falls Church' }), '2026-11-20').summary.status).toBe('closed');
  });
  it('Richmond city: deer archery only; no bear or turkey hunting', () => {
    expect(evaluate(deer, place({ city: 'Richmond' }), '2026-11-20').summary.weapon).toBe('archery');
    expect(evaluate(bear, place({ city: 'Richmond' }), '2026-12-01').summary.status).toBe('closed');
    expect(evaluate(turkey, place({ city: 'Richmond' }), '2027-04-15').summary.status).toBe('closed');
  });
  it('Prince William: no rifles for deer, but turkey can still use a .22', () => {
    expect(evaluate(deer, place({ county: 'Prince William' }), '2026-11-20').summary.weapon).toBe('shotgun');
    expect(evaluate(turkey, place({ county: 'Prince William' }), '2027-04-15').summary.weapon).toBe('firearms');
  });
  it('Halifax: rifles banned for spring turkey only', () => {
    expect(evaluate(turkey, place({ county: 'Halifax' }), '2027-04-15').summary.weapon).toBe('shotgun');
    expect(evaluate(turkey, place({ county: 'Halifax' }), '2026-10-20').summary.weapon).toBe('firearms');
  });
  it('towns: Rocky Mount bans firearms inside the town, not in the rest of Franklin County', () => {
    expect(evaluate(deer, place({ county: 'Franklin', town: 'Rocky Mount' }), '2026-11-20').summary.weapon).toBe('archery');
    expect(evaluate(deer, place({ county: 'Franklin' }), '2026-11-20').summary.weapon).toBe('firearms');
  });
  it('a county without a locality-wide weapon ban is unchanged', () => {
    expect(evaluate(deer, place({ county: 'Louisa' }), '2026-11-20').summary.weapon).toBe('firearms');
  });
  it('Buchanan elk ban is a warning, not applied over the state lottery hunt', () => {
    expect(localConflicts(place({ county: 'Buchanan' }), 'elk')).toHaveLength(1);
    expect(evaluate(elk, place({ county: 'Buchanan' }), '2026-10-12').summary.status).toBe('check');
  });
});
