/**
 * Scenario tests for the 2025–26 license year (Jul 1 2025 – Jun 30 2026).
 * Source: 2025–2026 Virginia Hunting & Trapping Regulations digest (25VAHD_LR.pdf,
 * sha256 19e03a91…7075). "p. N" is the PDF page; the printed page number is N − 2.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bear2025 as bear } from '../src/regs/bear-2025';
import { deer2025 as deer } from '../src/regs/deer-2025';
import { elk2025 as elk } from '../src/regs/elk-2025';
import { evaluate, matches } from '../src/regs/engine';
import { bobcat2025, coyote2025, fox2025, FURBEARERS_2025, opossum2025, raccoon2025 } from '../src/regs/furbearer-2025';
import { crow2025, grouse2025, pheasant2025, quail2025, rabbit2025, SMALL_GAME_2025, squirrel2025 } from '../src/regs/small-game-2025';
import { turkey2025 as turkey } from '../src/regs/turkey-2025';
import type { Place, Selector, SpeciesRegs, Where } from '../src/regs/types';
import { regionOf, splitFor } from '../src/regs/virginia';

const geo = (f: string) => JSON.parse(readFileSync(`public/data/${f}.geojson`, 'utf8')).features.map((x: any) => x.properties);
const jur = geo('jurisdictions');
const counties: string[] = [...new Set<string>(jur.filter((j: any) => j.type === 'county').map((j: any) => j.name))];
const cities = new Set(jur.filter((j: any) => j.type === 'city').map((j: any) => j.name));
const towns = new Set(geo('towns').map((p: any) => p.name));
const properties = new Set(geo('public-lands').map((p: any) => p.name));

const place = (p: Partial<Place>): Place => ({ land: 'private', region: regionOf(p.county, p.city), ...p });
const open = (regs: SpeciesRegs, p: Partial<Place>, iso: string) =>
  evaluate(regs, place(p), iso).open.map((o) => `${o.rule.type}:${o.take}${o.dogs ? ':dogs-' + o.dogs : ''}`).sort();
const status = (regs: SpeciesRegs, p: Partial<Place>, iso: string) => evaluate(regs, place(p), iso).summary.status;
const types = (regs: SpeciesRegs, p: Partial<Place>, iso: string) => evaluate(regs, place(p), iso).open.map((o) => o.rule.type).sort();

const ALL_2025: SpeciesRegs[] = [deer, bear, turkey, elk, ...SMALL_GAME_2025, ...FURBEARERS_2025];

describe.each(ALL_2025.map((r) => [r.species, r] as const))('%s 2025-26 data integrity', (_, regs) => {
  const all: Where[] = [];
  const walk = (s: Selector) => (Array.isArray(s) ? s : [s]).forEach((w) => { all.push(w); w.not?.forEach(walk); });
  [
    ...regs.seasons.map((s) => s.where),
    ...regs.eitherSex.map((e) => e.where),
    ...regs.info.map((i) => i.where),
    ...(regs.dogRules ?? []).map((d) => d.where),
  ].forEach(walk);
  const base = (n: string) => n.split('/')[0];

  it('is the 2025 license year', () => expect(regs.licenseYear).toBe(2025));

  it('referenced counties, cities, towns, and properties exist in the map data', () => {
    const missing = [
      ...all.flatMap((w) => [...(w.counties ?? []), ...(w.countiesInclCities ?? [])]).map(base).filter((n) => !counties.includes(n)),
      ...all.flatMap((w) => w.cities ?? []).map(base).filter((n) => !cities.has(n)),
      ...all.flatMap((w) => w.towns ?? []).filter((n) => !towns.has(n)),
      ...all.flatMap((w) => w.properties ?? []).filter((n) => !properties.has(n)),
    ];
    expect(missing).toEqual([]);
  });

  it('every split side used is a mapped side of that jurisdiction', () => {
    const bad: string[] = [];
    const check = (kind: 'county' | 'city', n: string) => {
      const [name, side] = n.split('/');
      if (!side) return;
      const split = splitFor(`${kind}:${name}`);
      if (!split?.mapped || !side.split('+').every((t) => t in split.parts)) bad.push(n);
    };
    all.forEach((w) => {
      [...(w.counties ?? []), ...(w.countiesInclCities ?? [])].forEach((n) => check('county', n));
      (w.cities ?? []).forEach((n) => check('city', n));
    });
    expect(bad).toEqual([]);
  });

  it('season dates are valid MM-DD', () => {
    const bad = regs.seasons.flatMap((s) => s.dates.flat()).filter((x) => !/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(x));
    expect(bad).toEqual([]);
  });
});

describe('2025-26 coverage', () => {
  it('rule ids referenced by local-ordinance effects exist', () => {
    const ids = turkey.seasons.map((s) => s.id);
    expect(ids).toEqual(expect.arrayContaining(['turkey-spring-noon', 'turkey-spring-allday', 'turkey-youth-spring']));
  });
  // p. 30: every county is in one bear group, except Accomack and Northampton (closed season).
  it('every county is in exactly one bear archery group (Accomack/Northampton: none)', () => {
    const groups = bear.seasons.filter((s) => s.type === 'archery');
    const problems = counties.filter(
      (c) => groups.filter((g) => matches(g.where, place({ county: c }))).length !== (['Accomack', 'Northampton'].includes(c) ? 0 : 1),
    );
    expect(problems).toEqual([]);
  });
  // p. 48
  it('every county except Arlington has exactly one fall firearms turkey season', () => {
    const fall = turkey.seasons.filter((s) => s.label === 'Fall firearms');
    const problems = counties.filter((c) => fall.filter((g) => matches(g.where, place({ county: c }))).length !== (c === 'Arlington' ? 0 : 1));
    expect(problems).toEqual([]);
  });
});

describe('deer 2025-26', () => {
  // p. 40: Augusta group Nov 15 – Dec 13, either-sex full season; late archery Dec 14 – Jan 3 (p. 38).
  it('Augusta private: firearms Nov 15 – Dec 13 either-sex, then late archery and muzzleloader from Dec 13/14', () => {
    expect(open(deer, { county: 'Augusta' }, '2025-11-15')).toEqual(['firearms:either-sex']);
    expect(open(deer, { county: 'Augusta' }, '2025-12-13')).toEqual(['firearms:either-sex', 'muzzleloader:either-sex']);
    expect(open(deer, { county: 'Augusta' }, '2025-12-14')).toEqual(['archery:either-sex', 'muzzleloader:either-sex']);
    expect(open(deer, { county: 'Augusta' }, '2025-11-14')).toEqual(['archery:either-sex', 'muzzleloader:either-sex']);
  });
  // p. 40: Dickenson & Wise either-sex Nov 29; Alleghany group Nov 22, 28, 29.
  it('either-sex days: Dickenson Nov 29 only; Alleghany Nov 22, 28, 29', () => {
    expect(open(deer, { county: 'Dickenson' }, '2025-11-29')).toEqual(['firearms:either-sex']);
    expect(open(deer, { county: 'Dickenson' }, '2025-11-22')).toEqual(['firearms:antlered']);
    expect(open(deer, { county: 'Alleghany' }, '2025-11-28')).toEqual(['firearms:either-sex']);
    expect(open(deer, { county: 'Alleghany' }, '2025-11-27')).toEqual(['firearms:antlered']);
    expect(open(deer, { county: 'Buchanan' }, '2025-11-29')).toEqual(['firearms:antlered']);
  });
  // p. 40: Henry & Patrick Nov 22, 29, Dec 1–13; Caroline group Nov 22, 29, Dec 22 – Jan 3.
  it('either-sex days: Henry Dec 1 (not Nov 30); Caroline Dec 22 (not Dec 21)', () => {
    expect(open(deer, { county: 'Henry' }, '2025-12-01')).toEqual(['firearms:either-sex']);
    expect(open(deer, { county: 'Henry' }, '2025-11-28')).toEqual(['firearms:antlered']);
    expect(open(deer, { county: 'Caroline' }, '2025-12-22')).toEqual(['firearms:either-sex']);
    expect(open(deer, { county: 'Caroline' }, '2025-12-21')).toEqual(['firearms:antlered']);
    expect(open(deer, { county: 'Caroline' }, '2026-01-03')).toEqual(['firearms:either-sex']);
    expect(open(deer, { county: 'Caroline' }, '2026-01-04')).toEqual([]);
  });
  // p. 42: National Forest "all counties unless otherwise noted" Nov 15–29, either-sex Nov 29.
  it('National Forest: Wise and Wythe either-sex only Nov 29; Bland Nov 28; Dickenson antlered only', () => {
    const nf = (county: string) => ({ county, land: 'national_forest' as const, property: 'George Washington & Jefferson National Forest' });
    expect(open(deer, nf('Wise'), '2025-11-29')).toEqual(['firearms:either-sex']);
    expect(open(deer, nf('Wythe'), '2025-11-28')).toEqual(['firearms:antlered']);
    expect(open(deer, nf('Wythe'), '2025-11-29')).toEqual(['firearms:either-sex']);
    expect(open(deer, nf('Bland'), '2025-11-28')).toEqual(['firearms:either-sex']);
    expect(open(deer, nf('Dickenson'), '2025-11-29')).toEqual(['firearms:antlered']);
    expect(open(deer, nf('Augusta'), '2025-11-30')).toEqual(['archery:either-sex']);
  });
  // p. 43: WMA table.
  it('WMAs: Turkeycock Dec 8–13 either-sex; White Oak Mountain Jan 1–3; Coastal Forest not in the table (check posted rules)', () => {
    const wma = (county: string, property: string) => ({ county, land: 'dwr' as const, property });
    expect(open(deer, wma('Franklin', 'Turkeycock Mountain WMA'), '2025-12-08')).toEqual(['firearms:either-sex']);
    expect(open(deer, wma('Franklin', 'Turkeycock Mountain WMA'), '2025-12-05')).toEqual(['firearms:antlered']);
    expect(open(deer, wma('Pittsylvania', 'White Oak Mountain WMA'), '2026-01-01')).toEqual(['firearms:either-sex']);
    expect(open(deer, wma('Pittsylvania', 'White Oak Mountain WMA'), '2025-12-31')).toEqual(['firearms:antlered']);
    expect(open(deer, wma('King and Queen', 'Coastal Forest WMA'), '2025-11-22')).toEqual(['firearms:check']);
  });
  // p. 42: state forests/parks/Army Corps.
  it('Cumberland State Forest Dec 6 either-sex; Philpott Reservoir Dec 8–13', () => {
    expect(open(deer, { county: 'Cumberland', land: 'state_forest', property: 'Cumberland' }, '2025-12-06')).toEqual(['firearms:either-sex']);
    expect(open(deer, { county: 'Cumberland', land: 'state_forest', property: 'Cumberland' }, '2025-12-07')).toEqual(['firearms:antlered']);
    expect(open(deer, { county: 'Henry', land: 'army_corps', property: 'Philpott Reservoir' }, '2025-12-08')).toEqual(['firearms:either-sex']);
  });
  // p. 38–39: early muzzleloader Nov 1–14; Craig full season (new in 2025-26), Bath Nov 8 only; Philpott Nov 8.
  it('early muzzleloader either-sex days', () => {
    expect(open(deer, { county: 'Craig' }, '2025-11-03')).toEqual(['archery:either-sex', 'muzzleloader:either-sex']);
    expect(open(deer, { county: 'Bath' }, '2025-11-08')).toEqual(['archery:either-sex', 'muzzleloader:either-sex']);
    expect(open(deer, { county: 'Bath' }, '2025-11-03')).toEqual(['archery:either-sex', 'muzzleloader:antlered']);
    expect(open(deer, { county: 'Henry', land: 'army_corps', property: 'Philpott Reservoir' }, '2025-11-08')).toContain('muzzleloader:either-sex');
    expect(open(deer, { county: 'Henry', land: 'army_corps', property: 'Philpott Reservoir' }, '2025-11-03')).toContain('muzzleloader:antlered');
    expect(open(deer, { county: 'Bath' }, '2025-10-31')).toEqual(['archery:either-sex']);
  });
  // p. 39: late muzzleloader east Dec 13 – Jan 3; full either-sex only in Henry and Patrick.
  it('late muzzleloader east: Henry either-sex; Franklin federal land antlered only', () => {
    expect(open(deer, { county: 'Henry' }, '2025-12-20')).toEqual(['archery:either-sex', 'muzzleloader:either-sex']);
    expect(open(deer, { county: 'Franklin', land: 'army_corps', property: 'Philpott Reservoir' }, '2025-12-20')).toEqual(['muzzleloader:antlered']);
    expect(open(deer, { city: 'Chesapeake' }, '2025-12-29')).toEqual(['archery:either-sex', 'muzzleloader:either-sex']);
    expect(open(deer, { city: 'Chesapeake' }, '2025-12-28')).toEqual(['archery:either-sex', 'muzzleloader:antlered']);
  });
  // p. 38: urban archery Sep 6 – Oct 3 and Jan 4 – Mar 29, 2026; Newport News added; no Cedar Bluff.
  it('urban archery localities and dates', () => {
    expect(open(deer, { city: 'Newport News' }, '2026-01-10')).toEqual(['urban_archery:antlerless']);
    expect(open(deer, { county: 'Tazewell', town: 'Tazewell' }, '2026-01-10')).toEqual(['urban_archery:antlerless']);
    expect(open(deer, { county: 'Tazewell', town: 'Cedar Bluff' }, '2026-01-10')).toEqual([]);
    expect(open(deer, { city: 'Newport News' }, '2025-09-06')).toEqual(['urban_archery:antlerless']);
    expect(open(deer, { city: 'Newport News' }, '2025-09-05')).toEqual([]);
    expect(open(deer, { city: 'Newport News' }, '2026-03-30')).toEqual([]);
  });
  // p. 38: NOVA late archery Mar 30 – Apr 26, 2026. p. 42: antlerless-only firearms.
  it('NOVA late archery and antlerless-only firearms (new in Greene, Hanover, Henrico, James City)', () => {
    expect(open(deer, { county: 'Fairfax' }, '2026-04-26')).toEqual(['urban_archery:antlerless']);
    expect(open(deer, { county: 'Fairfax' }, '2026-04-27')).toEqual([]);
    expect(open(deer, { county: 'Hanover' }, '2025-09-10')).toEqual(['antlerless_firearms:antlerless']);
    expect(open(deer, { county: 'Bedford' }, '2026-01-31')).toEqual(['antlerless_firearms:antlerless']);
    expect(open(deer, { county: 'Bedford' }, '2026-02-01')).toEqual([]);
  });
  // p. 37: youth weekend Sep 27–28; p. 44: no dogs Nov 15–28 in Madison and Greene.
  it('youth weekend and Madison dog dates', () => {
    expect(evaluate(deer, place({ county: 'Louisa' }), '2025-09-27', { includeYouth: true }).open.map((o) => o.rule.id)).toEqual(['deer-youth-weekend']);
    expect(evaluate(deer, place({ county: 'Louisa' }), '2025-09-26').open).toEqual([]);
    const dogInfo = (iso: string) => evaluate(deer, place({ county: 'Madison' }), iso).info.some((i) => i.id === 'deer-dogs-madison-greene');
    expect(dogInfo('2025-11-28')).toBe(true);
    expect(dogInfo('2025-11-29')).toBe(false);
  });
});

describe('bear 2025-26', () => {
  // p. 30: Accomack and Northampton have a closed season.
  it('Eastern Shore: closed season', () => {
    expect(open(bear, { county: 'Accomack' }, '2025-10-10')).toEqual([]);
    expect(open(bear, { county: 'Northampton' }, '2025-12-10')).toEqual([]);
  });
  // p. 30: Blue Ridge group firearms Nov 28–30 and Dec 22 – Jan 3; no hounds Nov 24–30 west.
  it('Rockingham: Nov 28 no hounds; Dec 22 hounds; Dec 1 hound training only (p. 31)', () => {
    expect(open(bear, { county: 'Rockingham', subArea: 'east' }, '2025-11-28')).toEqual(['firearms:any:dogs-no']);
    expect(open(bear, { county: 'Rockingham', subArea: 'east' }, '2025-12-22')).toEqual(['firearms:any:dogs-yes']);
    expect(types(bear, { county: 'Rockingham', subArea: 'east' }, '2025-12-01')).toEqual(['chase']);
    expect(status(bear, { county: 'Rockingham', subArea: 'east' }, '2025-12-01')).toBe('closed');
    // Dec 1–20 hound training excludes Sundays.
    expect(types(bear, { county: 'Rockingham', subArea: 'east' }, '2025-12-07')).toEqual([]);
    expect(types(bear, { county: 'Rockingham', subArea: 'east' }, '2025-12-21')).toEqual([]);
  });
  // p. 30: Southwest early firearms Sep 29 – Oct 1 (no WMA exclusion printed in 2025-26).
  it('Southwest early firearms Sep 29 – Oct 1, including Clinch Mountain WMA', () => {
    expect(open(bear, { county: 'Russell' }, '2025-09-30')).toEqual(['firearms:any:dogs-yes']);
    expect(open(bear, { county: 'Russell', land: 'dwr', property: 'Clinch Mountain WMA' }, '2025-09-30')).toEqual(['firearms:any:dogs-yes']);
    expect(open(bear, { county: 'Russell' }, '2025-10-02')).toEqual([]);
  });
  // p. 30–31: Charlotte firearms opens Nov 24; hound training Nov 15–23.
  it('Charlotte: hound training Nov 15–23, firearms from Nov 24', () => {
    expect(types(bear, { county: 'Charlotte' }, '2025-11-23')).toEqual(['chase']);
    expect(open(bear, { county: 'Charlotte' }, '2025-11-24')).toEqual(['firearms:any:dogs-yes']);
  });
  // p. 30: no hounds during firearms season south of I-81 in Roanoke, east of the New River in Grayson.
  it('hounds by side of I-81 / New River', () => {
    expect(open(bear, { county: 'Roanoke', subArea: 's81' }, '2025-12-01')).toEqual(['firearms:any:dogs-no']);
    expect(open(bear, { county: 'Roanoke', subArea: 'n81' }, '2025-12-01')).toEqual(['firearms:any:dogs-yes']);
    expect(open(bear, { county: 'Grayson', subArea: 'enr+e16' }, '2025-12-02')).toEqual(['firearms:any:dogs-no']);
    expect(open(bear, { county: 'Wythe', subArea: 'other' }, '2025-12-02')).toEqual(['firearms:any:dogs-yes']);
  });
  // p. 28: youth weekend Oct 11–12; dogs Saturday only; none in Smyth south of I-81 & west of Rt. 16.
  it('youth weekend: hounds Saturday Oct 11, not Sunday; not in Smyth s81+w16', () => {
    const dogs = (p: Partial<Place>, iso: string) =>
      evaluate(bear, place(p), iso, { includeYouth: true }).open.filter((o) => o.rule.youthOnly).map((o) => o.dogs);
    expect(dogs({ county: 'Louisa' }, '2025-10-11')).toEqual(['yes']);
    expect(dogs({ county: 'Louisa' }, '2025-10-12')).toEqual(['no']);
    expect(dogs({ county: 'Smyth', subArea: 's81+w16' }, '2025-10-11')).toEqual(['no']);
  });
  // p. 31: Cavalier WMA hound training Aug 9–23 only.
  it('Cavalier WMA hound training Aug 9–23', () => {
    const cav = { city: 'Chesapeake', land: 'dwr' as const, property: 'Cavalier WMA' };
    expect(types(bear, cav, '2025-08-09')).toEqual(['chase']);
    expect(types(bear, cav, '2025-08-05')).toEqual([]);
    expect(types(bear, { city: 'Chesapeake' }, '2025-08-05')).toEqual(['chase']);
  });
});

describe('turkey 2025-26', () => {
  // p. 48: G1 Oct 18–31 and Nov 27.
  it('Rockingham fall: Oct 18–31 and Nov 27 only', () => {
    expect(open(turkey, { county: 'Rockingham', subArea: 'east' }, '2025-10-18')).toEqual(['archery:either-sex', 'firearms:either-sex:dogs-yes']);
    expect(open(turkey, { county: 'Rockingham', subArea: 'east' }, '2025-11-26')).toEqual([]);
    expect(open(turkey, { county: 'Rockingham', subArea: 'east' }, '2025-11-27')).toEqual(['firearms:either-sex:dogs-yes']);
  });
  // p. 48: G2 includes Jan 10–24; G3 (Suffolk) closes Dec 13.
  it('Fairfax January season; Suffolk closes Dec 13', () => {
    expect(open(turkey, { county: 'Fairfax' }, '2026-01-10')).toEqual(['firearms:either-sex:dogs-yes']);
    expect(open(turkey, { county: 'Fairfax' }, '2026-01-09')).toEqual([]);
    expect(open(turkey, { city: 'Suffolk', subArea: 'west' }, '2025-12-13')).toEqual(['firearms:either-sex:dogs-yes']);
    expect(open(turkey, { city: 'Suffolk', subArea: 'west' }, '2025-12-14')).toEqual([]);
  });
  // p. 49: spring youth Apr 4–5, noon Apr 11–26, all day Apr 27 – May 16.
  it('spring: youth Apr 4–5, noon Apr 11–26, all day Apr 27 – May 16', () => {
    const ids = (iso: string) => evaluate(turkey, place({ county: 'Louisa' }), iso, { includeYouth: true }).open.map((o) => o.rule.id);
    expect(ids('2026-04-04')).toEqual(['turkey-youth-spring']);
    expect(ids('2026-04-10')).toEqual([]);
    expect(ids('2026-04-26')).toEqual(['turkey-spring-noon']);
    expect(ids('2026-04-27')).toEqual(['turkey-spring-allday']);
    expect(ids('2026-05-16')).toEqual(['turkey-spring-allday']);
    expect(ids('2026-05-17')).toEqual([]);
  });
  // p. 48: Arlington has no fall season; spring is statewide.
  it('Arlington: no fall season, spring open', () => {
    expect(open(turkey, { county: 'Arlington' }, '2025-10-20')).toEqual([]);
    expect(open(turkey, { county: 'Arlington' }, '2026-04-15')).toEqual(['firearms:bearded']);
  });
});

describe('elk 2025-26', () => {
  // p. 33: Elk Management Zone lottery hunt Oct 11–17, 2025.
  it('inside the Elk Management Zone: only the Oct 11–17 lottery hunt', () => {
    expect(evaluate(elk, place({ county: 'Wise' }), '2025-10-11').open.map((o) => o.take)).toEqual(['quota']);
    expect(evaluate(elk, place({ county: 'Wise' }), '2025-10-17').open.map((o) => o.take)).toEqual(['quota']);
    expect(open(elk, { county: 'Buchanan' }, '2025-10-18')).toEqual([]);
    expect(open(elk, { county: 'Dickenson' }, '2025-11-29')).toEqual([]);
  });
  // p. 33: outside the zone, any elk on any day of an open deer season.
  it('outside the zone, elk follows 2025-26 deer seasons day for day', () => {
    const p = place({ county: 'Bath' });
    for (const iso of ['2025-10-03', '2025-10-04', '2025-11-14', '2025-11-15', '2025-12-13', '2025-12-14', '2026-01-03', '2026-01-04']) {
      expect(evaluate(elk, p, iso).summary.status).toBe(evaluate(deer, p, iso).summary.status);
    }
    expect(open(elk, { county: 'Augusta' }, '2025-11-20')).toEqual(['firearms:any']);
  });
});

describe('small game 2025-26', () => {
  // p. 50: squirrel Sep 6 – Feb 28; spring Jun 6–20, 2026, closed on National Forest.
  it('squirrel fall and spring seasons', () => {
    expect(status(squirrel2025, { county: 'Louisa' }, '2025-09-06')).toBe('open');
    expect(status(squirrel2025, { county: 'Louisa' }, '2025-09-05')).toBe('closed');
    expect(status(squirrel2025, { county: 'Louisa' }, '2026-06-20')).toBe('open');
    expect(status(squirrel2025, { county: 'Louisa' }, '2026-06-21')).toBe('closed');
    expect(status(squirrel2025, { county: 'Bath', land: 'national_forest', property: 'George Washington & Jefferson National Forest' }, '2026-06-10')).toBe('closed');
  });
  // p. 50: crow Aug 16 – Mar 20 (Mon, Wed, Fri, Sat); National Forest & DWR lands Sep 1 – Mar 9.
  it('crow dates and weekdays', () => {
    expect(status(crow2025, { county: 'Louisa' }, '2025-08-16')).toBe('open'); // Saturday
    expect(status(crow2025, { county: 'Louisa' }, '2025-08-15')).toBe('closed'); // Friday, before opening
    const nf = { county: 'Bath', land: 'national_forest' as const, property: 'George Washington & Jefferson National Forest' };
    expect(status(crow2025, nf, '2025-08-18')).toBe('closed'); // Monday, before Sep 1
    expect(status(crow2025, nf, '2025-09-01')).toBe('open'); // Monday
    expect(status(crow2025, nf, '2026-03-09')).toBe('open'); // Monday
    expect(status(crow2025, { county: 'Louisa' }, '2026-03-20')).toBe('open'); // Friday
  });
  // p. 50: grouse Oct 25 – Feb 14 west of I-95; quail & pheasant Nov 8 – Jan 31; rabbit Nov 1 – Feb 28.
  it('grouse, quail, pheasant, rabbit', () => {
    expect(status(grouse2025, { county: 'Bath' }, '2025-10-25')).toBe('open');
    expect(status(grouse2025, { county: 'Bath' }, '2026-02-15')).toBe('closed');
    expect(status(grouse2025, { county: 'Accomack' }, '2025-11-01')).toBe('closed');
    expect(status(quail2025, { county: 'Louisa' }, '2025-11-08')).toBe('open');
    expect(status(quail2025, { county: 'Louisa' }, '2025-11-07')).toBe('closed');
    expect(status(quail2025, { county: 'Bath', land: 'dwr', property: 'Highland WMA' }, '2025-12-01')).toBe('closed');
    expect(status(pheasant2025, { county: 'Louisa' }, '2026-01-31')).toBe('open');
    expect(status(rabbit2025, { county: 'Louisa' }, '2025-11-01')).toBe('open');
    expect(status(rabbit2025, { county: 'Louisa' }, '2025-10-31')).toBe('closed');
  });
});

describe('furbearers 2025-26', () => {
  // p. 52: bobcat archery Oct 4–31, firearms Nov 1 – Feb 28.
  it('bobcat archery and firearms', () => {
    expect(types(bobcat2025, { county: 'Louisa' }, '2025-10-04')).toEqual(['archery']);
    expect(types(bobcat2025, { county: 'Louisa' }, '2025-10-03')).toEqual([]);
    expect(types(bobcat2025, { county: 'Louisa' }, '2026-02-28')).toEqual(['firearms']);
  });
  // p. 52: coyote on National Forest/DWR lands Sep 1 – Mar 10 and during the spring turkey season (Apr 11 – May 16).
  it('coyote on National Forest follows the 2026 spring turkey dates', () => {
    const nf = { county: 'Bath', land: 'national_forest' as const, property: 'George Washington & Jefferson National Forest' };
    expect(status(coyote2025, nf, '2026-04-10')).toBe('closed');
    expect(status(coyote2025, nf, '2026-04-11')).toBe('open');
    expect(status(coyote2025, nf, '2026-05-16')).toBe('open');
    expect(status(coyote2025, { county: 'Bath', land: 'dwr', property: 'Highland WMA' }, '2026-06-06')).toBe('open');
    expect(status(coyote2025, { county: 'Louisa' }, '2025-07-04')).toBe('open');
  });
  // p. 54: fox firearms closed in seven counties; gray fox Jan 1 – Feb 28; raccoon & opossum Oct 15 – Mar 10.
  it('fox, raccoon, opossum', () => {
    expect(status(fox2025, { county: 'Louisa' }, '2025-12-01')).toBe('closed');
    expect(status(fox2025, { county: 'Halifax' }, '2025-12-01')).toBe('open');
    expect(status(raccoon2025, { county: 'Louisa' }, '2025-10-15')).toBe('open');
    expect(status(opossum2025, { county: 'Louisa' }, '2026-03-11')).toBe('closed');
    // Raccoon chase on National Forest only Aug 1 – Sep 27.
    const nf = { county: 'Bath', land: 'national_forest' as const, property: 'George Washington & Jefferson National Forest' };
    expect(types(raccoon2025, nf, '2025-09-27')).toEqual(['chase']);
    expect(types(raccoon2025, nf, '2025-09-28')).toEqual([]);
  });
});
