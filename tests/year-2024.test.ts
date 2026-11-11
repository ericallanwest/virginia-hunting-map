/**
 * 2024-25 license year scenarios. Page numbers are the printed page numbers of the
 * 2024–2025 Hunting & Trapping in Virginia digest
 * (sha256 5174144546ede3b1249c77ba8fff93c0c22600ffaf95aad70d35594924d7bdda).
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bear2024 as bear } from '../src/regs/bear-2024';
import { deer2024 as deer } from '../src/regs/deer-2024';
import { elk2024 as elk } from '../src/regs/elk-2024';
import { evaluate, matches, seasonsForPlace } from '../src/regs/engine';
import { FURBEARERS_2024, bobcat2024, coyote2024, fox2024, raccoon2024 } from '../src/regs/furbearer-2024';
import { SMALL_GAME_2024, crow2024, grouse2024, groundhog2024, quail2024, rabbit2024, squirrel2024 } from '../src/regs/small-game-2024';
import { turkey2024 as turkey } from '../src/regs/turkey-2024';
import type { Place, Selector, SpeciesRegs, Where } from '../src/regs/types';
import { regionOf, splitFor } from '../src/regs/virginia';

const geo = (f: string) => JSON.parse(readFileSync(`public/data/${f}.geojson`, 'utf8')).features.map((x: any) => x.properties);
const jur = geo('jurisdictions');
const counties: string[] = [...new Set<string>(jur.filter((j: any) => j.type === 'county').map((j: any) => j.name))];
const cities = new Set(jur.filter((j: any) => j.type === 'city').map((j: any) => j.name));
const towns = new Set(geo('towns').map((p: any) => p.name));
const properties = new Set(geo('public-lands').map((p: any) => p.name));

const place = (p: Partial<Place>): Place => ({ land: 'private', region: regionOf(p.county, p.city), ...p });
/** Open seasons as 'type:take[:dogs-x]', sorted. */
const open = (regs: SpeciesRegs, p: Partial<Place>, iso: string) =>
  evaluate(regs, place(p), iso).open.map((o) => `${o.rule.type}:${o.take}${o.dogs ? ':dogs-' + o.dogs : ''}`).sort();
const ids = (regs: SpeciesRegs, p: Partial<Place>, iso: string) => evaluate(regs, place(p), iso).open.map((o) => o.rule.id).sort();

/** Every side of a county's mapped split ('s81+w16' style combinations included). */
function sides(county: string): (string | undefined)[] {
  const split = splitFor(`county:${county}`);
  if (!split) return [undefined];
  const keys = Object.keys(split.parts);
  const groups: string[][] = [];
  for (const k of keys) {
    const pair = keys.find((o) => o !== k && o.slice(1) === k.slice(1) && !groups.some((g) => g.includes(o)));
    if (!groups.some((g) => g.includes(k))) groups.push(pair ? [k, pair] : [k]);
  }
  // Pairs like s81/n81, e16/w16, enr/wnr, east/west, senr/other; combine across lines.
  const lines = groups.length === keys.length ? [keys] : groups;
  return lines.reduce<string[]>((acc, g) => (acc.length ? acc.flatMap((a) => g.map((x) => `${a}+${x}`)) : g), []);
}

const ALL = [deer, bear, turkey, elk, ...SMALL_GAME_2024, ...FURBEARERS_2024];

describe.each(ALL.map((r) => [`${r.species}`, r] as const))('%s 2024 data integrity', (_, regs) => {
  const all: Where[] = [];
  const walk = (s: Selector) => (Array.isArray(s) ? s : [s]).forEach((w) => { all.push(w); w.not?.forEach(walk); });
  [...regs.seasons.map((s) => s.where), ...regs.eitherSex.map((e) => e.where), ...regs.info.map((i) => i.where), ...(regs.dogRules ?? []).map((d) => d.where)].forEach(walk);
  const base = (n: string) => n.split('/')[0];

  it('is the 2024 license year with unique season ids', () => {
    expect(regs.licenseYear).toBe(2024);
    const s = regs.seasons.map((x) => x.id);
    expect(s.filter((id, i) => s.indexOf(id) !== i)).toEqual([]);
  });
  it('references only counties, cities, towns, and properties in the map data', () => {
    expect([
      ...all.flatMap((w) => [...(w.counties ?? []), ...(w.countiesInclCities ?? [])]).map(base).filter((n) => !counties.includes(n)),
      ...all.flatMap((w) => w.cities ?? []).map(base).filter((n) => !cities.has(n)),
      ...all.flatMap((w) => w.towns ?? []).filter((n) => !towns.has(n)),
      ...all.flatMap((w) => w.properties ?? []).filter((n) => !properties.has(n)),
    ]).toEqual([]);
  });
  it('uses only mapped split sides', () => {
    const bad = all
      .flatMap((w) => [...(w.counties ?? []), ...(w.countiesInclCities ?? []), ...(w.cities ?? [])])
      .filter((n) => n.includes('/'))
      .filter((n) => {
        const [b, side] = n.split('/');
        const split = splitFor(`county:${b}`) ?? splitFor(`city:${b}`);
        return !split?.mapped || !side.split('+').every((t) => t in split.parts);
      });
    expect(bad).toEqual([]);
  });
});

describe('2024 county coverage', () => {
  it('every county side is in exactly one deer general firearms group (p. 40–41)', () => {
    const groups = deer.seasons.filter((s) => s.type === 'firearms' && s.id !== 'deer-firearms-cities-towns' && s.id !== 'deer-firearms-csv');
    const problems: string[] = [];
    for (const c of counties)
      for (const subArea of sides(c)) {
        const hits = groups.filter((g) => matches(g.where, place({ county: c, subArea })));
        if (hits.length !== 1) problems.push(`${c}/${subArea}: ${hits.map((h) => h.id).join(',')}`);
      }
    expect(problems).toEqual([]);
  });
  it('every county except Accomack/Northampton has general bear firearms (Wythe by partial halves) (p. 30)', () => {
    const fw = bear.seasons.filter((s) => s.type === 'firearms' && s.label === 'Firearms');
    const problems: string[] = [];
    for (const c of counties)
      for (const subArea of sides(c)) {
        const hits = fw.filter((g) => matches(g.where, place({ county: c, subArea })));
        const want = ['Accomack', 'Northampton'].includes(c) ? 0 : c === 'Wythe' ? 2 : 1;
        if (hits.length !== want) problems.push(`${c}/${subArea}: ${hits.length}`);
      }
    expect(problems).toEqual([]);
  });
  it('every county except Arlington has exactly one fall firearms turkey season (p. 46)', () => {
    const fall = turkey.seasons.filter((s) => s.label === 'Fall firearms');
    const problems = counties.filter((c) => fall.filter((g) => matches(g.where, place({ county: c }))).length !== (c === 'Arlington' ? 0 : 1));
    expect(problems).toEqual([]);
  });
});

describe('deer 2024-25', () => {
  // p. 37: youth weekend Sep 28-29
  it('youth & apprentice weekend is Sep 28–29, either sex', () => {
    expect(open(deer, { county: 'Louisa' }, '2024-09-28')).toEqual(['youth:either-sex']);
    expect(open(deer, { county: 'Louisa' }, '2024-09-30')).toEqual([]);
  });
  // p. 38: early archery Oct 5 – Nov 15 statewide
  it('early archery opens Oct 5 (not Oct 3)', () => {
    expect(open(deer, { county: 'Augusta' }, '2024-10-04')).toEqual([]);
    expect(open(deer, { county: 'Augusta' }, '2024-10-05')).toEqual(['archery:either-sex']);
  });
  // p. 40: Augusta (blue group) Nov 16 – 30, full-season either-sex; Nov 30 only on National Forest
  it('Augusta private land: firearms Nov 16–30 either sex; National Forest antlered except Nov 30', () => {
    expect(open(deer, { county: 'Augusta' }, '2024-11-18')).toEqual(['firearms:either-sex']);
    expect(open(deer, { county: 'Augusta' }, '2024-12-02')).toEqual(['archery:either-sex']); // late archery from Dec 1 (p. 38)
    expect(open(deer, { county: 'Augusta', land: 'national_forest' }, '2024-11-18')).toEqual(['firearms:antlered']);
    expect(open(deer, { county: 'Augusta', land: 'national_forest' }, '2024-11-30')).toEqual(['firearms:either-sex']);
  });
  // p. 40: Rockingham west of Rts. 613/731 private land: Nov 23 and 30
  it('Rockingham west private land: either-sex only Nov 23 and Nov 30', () => {
    expect(open(deer, { county: 'Rockingham', subArea: 'west' }, '2024-11-22')).toEqual(['firearms:antlered']);
    expect(open(deer, { county: 'Rockingham', subArea: 'west' }, '2024-11-23')).toEqual(['firearms:either-sex']);
    expect(open(deer, { county: 'Rockingham', subArea: 'east' }, '2024-11-22')).toEqual(['firearms:either-sex']);
  });
  // p. 41: Buchanan/Dickenson/Wise antlered only
  it('Wise County: firearms antlered only, Nov 16–30', () => {
    expect(open(deer, { county: 'Wise' }, '2024-11-23')).toEqual(['firearms:antlered']);
  });
  // p. 41: Henry & Patrick Nov 16 – Dec 14, either sex Nov 23, 30, Dec 2–14
  it('Henry County: either-sex Nov 23, antlered Nov 25, either-sex Dec 5; Philpott Reservoir antlered Dec 5', () => {
    expect(open(deer, { county: 'Henry' }, '2024-11-23')).toEqual(['firearms:either-sex']);
    expect(open(deer, { county: 'Henry' }, '2024-11-25')).toEqual(['firearms:antlered']);
    expect(open(deer, { county: 'Henry' }, '2024-12-05')).toEqual(['firearms:either-sex']);
    expect(open(deer, { county: 'Henry', land: 'army_corps', property: 'Philpott Reservoir' }, '2024-12-05')).toEqual(['firearms:antlered']);
    expect(open(deer, { county: 'Henry', land: 'army_corps', property: 'Philpott Reservoir' }, '2024-12-10')).toEqual(['firearms:either-sex']);
  });
  // p. 41: Bedford (Nov 16 – Dec 14 group) vs. National Forest in Bedford (Nov 16 – 30, either-sex Nov 30)
  it('Bedford: private land open Dec 10; National Forest closes Nov 30', () => {
    expect(ids(deer, { county: 'Bedford' }, '2024-12-10')).toEqual(['deer-firearms-dec14-green']);
    expect(open(deer, { county: 'Bedford', land: 'national_forest' }, '2024-11-30')).toEqual(['firearms:either-sex']);
    expect(open(deer, { county: 'Bedford', land: 'national_forest' }, '2024-12-02')).toEqual(['archery:either-sex']);
  });
  // p. 40: Culpeper (tan group) full season to Jan 4; C. F. Phelps WMA Nov 16–30, either-sex Nov 23
  it('Culpeper private land open to Jan 4 either sex; C. F. Phelps WMA closes Nov 30', () => {
    expect(open(deer, { county: 'Culpeper' }, '2025-01-04')).toEqual(['firearms:either-sex']);
    expect(open(deer, { county: 'Culpeper', land: 'dwr', property: 'C.F. Phelps WMA' }, '2024-11-23')).toEqual(['firearms:either-sex']);
    expect(open(deer, { county: 'Culpeper', land: 'dwr', property: 'C.F. Phelps WMA' }, '2024-11-25')).toEqual(['firearms:antlered']);
    expect(ids(deer, { county: 'Culpeper', land: 'dwr', property: 'C.F. Phelps WMA' }, '2024-12-02')).toEqual(['deer-archery-late-dec1']);
  });
  // p. 41: red group (Mecklenburg) either-sex Nov 23, 30, Dec 30 – Jan 4
  it('Mecklenburg: antlered Dec 2, either sex Dec 30', () => {
    expect(open(deer, { county: 'Mecklenburg' }, '2024-12-02')).toEqual(['firearms:antlered']);
    expect(open(deer, { county: 'Mecklenburg' }, '2024-12-30')).toEqual(['firearms:either-sex']);
  });
  // p. 41: orange group: Campbell east of the railroad vs. tan group west of it
  it('Campbell: east of the railroad antlered Dec 2; west of it either sex', () => {
    expect(open(deer, { county: 'Campbell', subArea: 'east' }, '2024-12-02')).toEqual(['firearms:antlered']);
    expect(open(deer, { county: 'Campbell', subArea: 'west' }, '2024-12-02')).toEqual(['firearms:either-sex']);
  });
  // p. 41: Chesapeake / Suffolk east / Virginia Beach Oct 1 – Nov 30 full season
  it('Virginia Beach firearms Oct 1 – Nov 30 either sex (with early archery)', () => {
    expect(open(deer, { city: 'Virginia Beach' }, '2024-10-10')).toEqual(['archery:either-sex', 'firearms:either-sex']);
  });
  // p. 38–39: early muzzleloader Nov 2–15; east state forests either-sex only Nov 9
  it('early muzzleloader Nov 2–15: Cumberland State Forest either sex only Nov 9; private land east full season', () => {
    const sf = { county: 'Cumberland', land: 'state_forest' as const, property: 'Cumberland' };
    expect(open(deer, sf, '2024-11-04')).toEqual(['archery:either-sex', 'muzzleloader:antlered']);
    expect(open(deer, sf, '2024-11-09')).toEqual(['archery:either-sex', 'muzzleloader:either-sex']);
    expect(open(deer, { county: 'Cumberland' }, '2024-11-04')).toEqual(['archery:either-sex', 'muzzleloader:either-sex']);
  });
  // p. 39: late muzzleloader east Dec 14 – Jan 4 in Bedford (private: full season either-sex)
  it('Bedford private: late muzzleloader Dec 14 either sex (overlaps the firearms season)', () => {
    expect(open(deer, { county: 'Bedford' }, '2024-12-14')).toEqual(['firearms:antlered', 'muzzleloader:either-sex']);
    expect(open(deer, { county: 'Bedford' }, '2024-12-20')).toEqual(['archery:either-sex', 'muzzleloader:either-sex']);
  });
  // p. 38: urban archery Sep 7 – Oct 4 and Jan 5 – Mar 30, incl. Williamsburg; not Newport News
  it('urban archery: Williamsburg yes, Newport News no (2024 list)', () => {
    expect(open(deer, { city: 'Williamsburg' }, '2024-09-10')).toEqual(['urban_archery:antlerless']);
    expect(open(deer, { city: 'Newport News' }, '2024-09-10')).toEqual([]);
    expect(open(deer, { city: 'Williamsburg' }, '2025-03-30')).toEqual(['urban_archery:antlerless']);
  });
  // p. 41: antlerless-only firearms: Hanover not included in 2024; Bedford private to Jan 31
  it('antlerless-only firearms: Clarke yes, Hanover no; Bedford to Jan 31', () => {
    expect(open(deer, { county: 'Clarke' }, '2024-09-10')).toEqual(['antlerless_firearms:antlerless']);
    expect(open(deer, { county: 'Hanover' }, '2024-09-10')).toEqual([]);
    expect(open(deer, { county: 'Bedford' }, '2025-01-31')).toEqual(['antlerless_firearms:antlerless']);
    expect(open(deer, { county: 'Bedford' }, '2025-02-01')).toEqual([]);
  });
  // p. 38: NOVA late archery Mar 31 – Apr 27, 2025
  it('NOVA late archery Mar 31 – Apr 27', () => {
    expect(open(deer, { county: 'Loudoun' }, '2025-04-27')).toEqual(['urban_archery:antlerless']);
  });
  // p. 36: Earn a Buck private-land list (Craig, Giles, Chesterfield, Spotsylvania not EAB in 2024)
  it('Earn a Buck: Grayson yes; Craig and Chesterfield no', () => {
    const eab = (c: string) => evaluate(deer, place({ county: c }), '2024-11-20').info.some((i) => i.topic === 'eab');
    expect(eab('Grayson')).toBe(true);
    expect(eab('Craig')).toBe(false);
    expect(eab('Chesterfield')).toBe(false);
  });
  // p. 40: Grayson Highlands State Park: Nov 16–30, either sex Nov 30 (portions)
  it('state parks: Grayson Highlands named; other parks are "check posted rules"', () => {
    expect(open(deer, { county: 'Grayson', subArea: 'wnr+w16', land: 'state_park', property: 'Grayson Highlands State Park' }, '2024-11-30'))
      .toContain('firearms:either-sex');
    const sp = seasonsForPlace(deer, place({ county: 'Halifax', land: 'state_park', property: 'Staunton River State Park' }));
    expect(sp.some((s) => s.rule.type === 'firearms')).toBe(false);
    expect(evaluate(deer, place({ county: 'Halifax', land: 'state_park', property: 'Staunton River State Park' }), '2024-11-01').summary.status).toBe('check');
  });
});

describe('bear 2024-25', () => {
  // p. 28: archery Oct 5 – Nov 15 statewide (incl. Accomack)
  it('archery statewide Oct 5 – Nov 15, including the Eastern Shore', () => {
    expect(open(bear, { county: 'Accomack' }, '2024-10-05')).toEqual(['archery:any']);
    expect(open(bear, { county: 'Rockingham', subArea: 'east' }, '2024-10-07')).toEqual(['archery:any']);
  });
  // p. 29: muzzleloader Nov 9–15 statewide
  it('muzzleloader Nov 9–15 statewide (overlapping archery)', () => {
    expect(open(bear, { county: 'Halifax' }, '2024-11-12')).toEqual(['archery:any', 'muzzleloader:any']);
    expect(open(bear, { county: 'Halifax' }, '2024-11-08')).toEqual(['archery:any']);
  });
  // p. 30: early firearms Sep 30 – Oct 2; Montgomery only north of I-81
  it('early firearms Sep 30 – Oct 2 in Russell; Montgomery north of I-81 only', () => {
    expect(open(bear, { county: 'Russell' }, '2024-10-01')).toEqual(['firearms:any:dogs-yes']);
    expect(open(bear, { county: 'Montgomery', subArea: 'n81' }, '2024-10-01')).toEqual(['firearms:any:dogs-yes']);
    expect(open(bear, { county: 'Montgomery', subArea: 's81' }, '2024-10-01')).toEqual([]);
  });
  // p. 30–31: Montgomery south of I-81: firearms from Dec 2, no hounds; north of I-81 from Nov 25
  it('Montgomery: north of I-81 opens Nov 25 (no hounds until Dec 2); south of I-81 opens Dec 2 without hounds', () => {
    expect(open(bear, { county: 'Montgomery', subArea: 'n81' }, '2024-11-26')).toEqual(['firearms:any:dogs-no']);
    expect(open(bear, { county: 'Montgomery', subArea: 'n81' }, '2024-12-03')).toEqual(['firearms:any:dogs-yes']);
    expect(open(bear, { county: 'Montgomery', subArea: 's81' }, '2024-11-26')).toEqual([]);
    expect(open(bear, { county: 'Montgomery', subArea: 's81' }, '2024-12-03')).toEqual(['firearms:any:dogs-no']);
  });
  // p. 30: Wythe split at I-81 is not mapped → both halves shown with partial notes
  it('Wythe: I-81 is unmapped, so both seasons carry a partial note', () => {
    const fw = evaluate(bear, place({ county: 'Wythe', subArea: 'other' }), '2024-12-03').open.filter((o) => o.rule.type === 'firearms');
    expect(fw).toHaveLength(2);
    expect(fw.every((o) => !!o.rule.partialNote)).toBe(true);
  });
  // p. 30: Accomack/Northampton closed to firearms; CSV Oct 1 – Jan 4
  it('Accomack has no firearms season; Chesapeake opens Oct 1', () => {
    expect(open(bear, { county: 'Accomack' }, '2024-12-10')).toEqual([]);
    expect(open(bear, { city: 'Chesapeake' }, '2024-10-01')).toEqual(['firearms:any:dogs-yes']);
  });
  // p. 31: Madison & Greene no hounds Nov 25–29
  it('Madison: no hounds Nov 26, hounds Dec 2 (Monday)', () => {
    expect(open(bear, { county: 'Madison' }, '2024-11-26')).toEqual(['firearms:any:dogs-no']);
    expect(open(bear, { county: 'Madison' }, '2024-12-02')).toEqual(['firearms:any:dogs-yes']);
  });
  // p. 31: hound training Nov 16–30 (east of the Norfolk Southern Railroad) and Aug 1 – Sep 28
  it('hound training: Pittsylvania east Nov 20 yes, west no; Aug 1 – Sep 28 in Bath; Cavalier WMA Aug 10–24', () => {
    expect(open(bear, { county: 'Pittsylvania', subArea: 'east' }, '2024-11-20')).toEqual(['chase:none']);
    expect(open(bear, { county: 'Pittsylvania', subArea: 'west' }, '2024-11-20')).toEqual([]);
    expect(open(bear, { county: 'Bath' }, '2024-09-28')).toEqual(['chase:none']);
    expect(open(bear, { county: 'Bath' }, '2024-12-03')).toEqual(['firearms:any:dogs-yes']);
    expect(open(bear, { city: 'Chesapeake', land: 'dwr', property: 'Cavalier WMA' }, '2024-08-05')).toEqual([]);
    expect(open(bear, { city: 'Chesapeake', land: 'dwr', property: 'Cavalier WMA' }, '2024-08-12')).toEqual(['chase:none']);
  });
  // p. 31 map: Smyth south of I-81 and west of Rt. 16 is closed to summer hound training
  it('Smyth: hound training Aug 15 north of I-81 yes; south of I-81 and west of Rt. 16 no', () => {
    expect(open(bear, { county: 'Smyth', subArea: 'n81+w16' }, '2024-08-15')).toEqual(['chase:none']);
    expect(open(bear, { county: 'Smyth', subArea: 's81+e16' }, '2024-08-15')).toEqual(['chase:none']);
    expect(open(bear, { county: 'Smyth', subArea: 's81+w16' }, '2024-08-15')).toEqual([]);
  });
  // p. 28: youth weekend Oct 12–13, dogs Saturday except listed areas
  it('youth weekend Oct 12: dogs in Bath, not in Patrick; Sunday Oct 13 no dogs', () => {
    expect(open(bear, { county: 'Bath' }, '2024-10-12')).toEqual(['archery:any', 'youth:any:dogs-yes']);
    expect(open(bear, { county: 'Patrick' }, '2024-10-12')).toEqual(['archery:any', 'youth:any:dogs-no']);
    expect(open(bear, { county: 'Bath' }, '2024-10-13')).toEqual(['archery:any', 'youth:any:dogs-no']);
  });
});

describe('turkey 2024-25', () => {
  // p. 46: fall groups
  it('fall: Augusta Oct 19 – Nov 1 and Nov 28 only', () => {
    expect(open(turkey, { county: 'Augusta' }, '2024-10-19')).toEqual(['archery:either-sex', 'firearms:either-sex:dogs-yes']);
    expect(open(turkey, { county: 'Augusta' }, '2024-11-27')).toEqual([]);
    expect(open(turkey, { county: 'Augusta' }, '2024-11-28')).toEqual(['firearms:either-sex:dogs-yes']);
  });
  it('fall: Bedford open Dec 28 and Jan 11; Accomack closes Dec 14; Arlington closed', () => {
    expect(open(turkey, { county: 'Bedford' }, '2024-12-28')).toEqual(['firearms:either-sex:dogs-yes']);
    expect(open(turkey, { county: 'Bedford' }, '2025-01-11')).toEqual(['firearms:either-sex:dogs-yes']);
    expect(open(turkey, { county: 'Accomack' }, '2024-12-16')).toEqual([]);
    expect(open(turkey, { county: 'Arlington' }, '2024-10-20')).toEqual([]);
  });
  // p. 47: spring Apr 12–27 until noon, Apr 28 – May 17 all day; youth Apr 5–6
  it('spring 2025: youth Apr 5–6, noon season Apr 12–27, all-day Apr 28 – May 17', () => {
    expect(ids(turkey, { county: 'Louisa' }, '2025-04-05')).toEqual(['turkey-youth-spring']);
    expect(ids(turkey, { county: 'Louisa' }, '2025-04-27')).toEqual(['turkey-spring-noon']);
    expect(ids(turkey, { county: 'Louisa' }, '2025-04-28')).toEqual(['turkey-spring-allday']);
    expect(ids(turkey, { county: 'Louisa' }, '2025-05-17')).toEqual(['turkey-spring-allday']);
    expect(ids(turkey, { county: 'Louisa' }, '2025-05-18')).toEqual([]);
  });
  // p. 46: bag limit — no more than two in the fall
  it('bag limit: 3 per year, no more than 2 in the fall', () => {
    const bag = evaluate(turkey, place({ county: 'Louisa' }), '2024-11-01').info.find((i) => i.topic === 'bag');
    expect(bag?.text).toMatch(/no more than 2 of which may be taken in the fall/);
  });
});

describe('elk 2024-25', () => {
  // p. 33: Elk Management Zone hunt Oct 12–18, 2024
  it('Elk Management Zone lottery hunt Oct 12–18 only; outside the zone follows deer seasons', () => {
    expect(open(elk, { county: 'Buchanan' }, '2024-10-12')).toEqual(['firearms:quota']);
    expect(open(elk, { county: 'Buchanan' }, '2024-10-19')).toEqual([]);
    expect(open(elk, { county: 'Buchanan' }, '2024-11-20')).toEqual([]);
    expect(open(elk, { county: 'Russell' }, '2024-11-20')).toEqual(['firearms:any']);
  });
});

describe('small game 2024-25', () => {
  // p. 48
  it('squirrel Sep 7; fox squirrel only in listed counties; spring Jun 7–21 closed on National Forest', () => {
    expect(open(squirrel2024, { county: 'Louisa' }, '2024-09-06')).toEqual([]);
    expect(open(squirrel2024, { county: 'Louisa' }, '2024-09-07')).toEqual(['firearms:any:dogs-yes']);
    expect(open(squirrel2024, { county: 'Albemarle' }, '2024-09-07')).toHaveLength(2);
    expect(open(squirrel2024, { county: 'Louisa' }, '2025-06-21')).toEqual(['firearms:any:dogs-yes']);
    expect(open(squirrel2024, { county: 'Bath', land: 'national_forest' }, '2025-06-10')).toEqual([]);
  });
  it('rabbit Nov 2 – Feb 28; quail Nov 9 – Jan 31 closed on public land west; grouse Oct 26 – Feb 8 west of I-95', () => {
    expect(open(rabbit2024, { county: 'Louisa' }, '2024-11-02')).toEqual(['firearms:any:dogs-yes']);
    expect(open(quail2024, { county: 'Louisa' }, '2024-11-08')).toEqual([]);
    expect(open(quail2024, { county: 'Louisa' }, '2024-11-09')).toEqual(['firearms:any:dogs-yes']);
    expect(open(quail2024, { county: 'Bath', land: 'national_forest' }, '2024-12-01')).toEqual([]);
    expect(open(grouse2024, { county: 'Bath' }, '2025-02-08')).toEqual(['firearms:any:dogs-yes']);
    expect(open(grouse2024, { county: 'Hanover', subArea: 'e95' }, '2024-12-01')).toEqual([]);
  });
  it('crow Aug 17 – Mar 21 on Mon/Wed/Fri/Sat; groundhog on DWR land during spring turkey (Apr 12 – May 17)', () => {
    expect(open(crow2024, { county: 'Louisa' }, '2024-08-17')).toEqual(['firearms:any:dogs-yes']); // Saturday
    expect(open(crow2024, { county: 'Louisa' }, '2024-08-18')).toEqual([]); // Sunday
    expect(open(crow2024, { county: 'Louisa' }, '2025-03-21')).toEqual(['firearms:any:dogs-yes']); // Friday
    expect(open(groundhog2024, { county: 'Bath', land: 'dwr', property: 'Gathright WMA' }, '2025-05-17')).toEqual(['firearms:any:dogs-yes']);
    expect(open(groundhog2024, { county: 'Bath', land: 'dwr', property: 'Gathright WMA' }, '2025-05-20')).toEqual([]);
  });
});

describe('furbearers 2024-25', () => {
  // pp. 50–52
  it('bobcat archery Oct 5–31, firearms Nov 1 – Feb 28', () => {
    expect(open(bobcat2024, { county: 'Louisa' }, '2024-10-04')).toEqual([]);
    expect(open(bobcat2024, { county: 'Louisa' }, '2024-10-05')).toEqual(['archery:any']);
    expect(open(bobcat2024, { county: 'Louisa' }, '2025-02-28')).toEqual(['firearms:any:dogs-yes']);
  });
  it('fox closed in Loudoun; raccoon chase on National Forest Aug 1 – Sep 28; coyote on DWR land in spring squirrel season', () => {
    expect(open(fox2024, { county: 'Loudoun' }, '2024-12-01')).toEqual(['chase:none']);
    expect(open(raccoon2024, { county: 'Bath', land: 'national_forest' }, '2024-09-28')).toEqual(['chase:none']);
    expect(open(raccoon2024, { county: 'Bath', land: 'national_forest' }, '2024-09-29')).toEqual([]);
    expect(open(coyote2024, { county: 'Bath', land: 'dwr', property: 'Gathright WMA' }, '2025-06-07')).toHaveLength(1);
  });
});
