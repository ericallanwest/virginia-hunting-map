import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bear2026 as bear } from '../src/regs/bear-2026';
import { deer2026 } from '../src/regs/deer-2026';
import { elk2026 as elk } from '../src/regs/elk-2026';
import { evaluate, matches } from '../src/regs/engine';
import { turkey2026 as turkey } from '../src/regs/turkey-2026';
import type { Place, Selector, SpeciesRegs, Where } from '../src/regs/types';
import { regionOf } from '../src/regs/virginia';

const geo = (f: string) => JSON.parse(readFileSync(`public/data/${f}.geojson`, 'utf8')).features.map((x: any) => x.properties);
const jur = geo('jurisdictions');
const counties: string[] = [...new Set<string>(jur.filter((j: any) => j.type === 'county').map((j: any) => j.name))];
const cities = new Set(jur.filter((j: any) => j.type === 'city').map((j: any) => j.name));
const towns = new Set(geo('towns').map((p: any) => p.name));
const properties = new Set(geo('public-lands').map((p: any) => p.name));

const place = (p: Partial<Place>): Place => ({ land: 'private', region: regionOf(p.county, p.city), ...p });
const open = (regs: SpeciesRegs, p: Partial<Place>, iso: string) =>
  evaluate(regs, place(p), iso).open.map((o) => `${o.rule.type}:${o.take}${o.dogs ? ':dogs-' + o.dogs : ''}`).sort();

describe.each([
  ['bear', bear],
  ['turkey', turkey],
  ['elk', elk],
])('%s data integrity', (_, regs) => {
  const all: Where[] = [];
  const walk = (s: Selector) => (Array.isArray(s) ? s : [s]).forEach((w) => { all.push(w); w.not?.forEach(walk); });
  [...regs.seasons.map((s) => s.where), ...regs.info.map((i) => i.where), ...(regs.dogRules ?? []).map((d) => d.where)].forEach(walk);
  const base = (n: string) => n.split('/')[0];

  it('referenced counties, cities, towns, and properties exist in the map data', () => {
    const missing = [
      ...all.flatMap((w) => [...(w.counties ?? []), ...(w.countiesInclCities ?? [])]).map(base).filter((n) => !counties.includes(n)),
      ...all.flatMap((w) => w.cities ?? []).map(base).filter((n) => !cities.has(n)),
      ...all.flatMap((w) => w.towns ?? []).filter((n) => !towns.has(n)),
      ...all.flatMap((w) => w.properties ?? []).filter((n) => !properties.has(n)),
    ];
    expect(missing).toEqual([]);
  });
});

describe('county coverage', () => {
  it('every county is in exactly one bear season group', () => {
    const groups = bear.seasons.filter((s) => s.type === 'archery');
    const problems = counties.filter((c) => groups.filter((g) => matches(g.where, place({ county: c }))).length !== 1);
    expect(problems).toEqual([]);
  });
  it('every county except Arlington has exactly one fall firearms turkey season', () => {
    const fall = turkey.seasons.filter((s) => s.type === 'firearms' && s.label === 'Fall firearms');
    const problems = counties.filter((c) => fall.filter((g) => matches(g.where, place({ county: c }))).length !== (c === 'Arlington' ? 0 : 1));
    expect(problems).toEqual([]);
  });
});

describe('bear scenarios (2026-27)', () => {
  it('Rockingham: Nov 28 firearms open but no hounds (Nov 23–29 west of the Blue Ridge)', () => {
    expect(open(bear, { county: 'Rockingham', subArea: 'east' }, '2026-11-28')).toEqual(['firearms:any:dogs-no']);
  });
  it('Rockingham: Dec 22 hounds allowed; Sunday Dec 27 no hounds', () => {
    expect(open(bear, { county: 'Rockingham', subArea: 'east' }, '2026-12-22')).toEqual(['firearms:any:dogs-yes']);
    expect(open(bear, { county: 'Rockingham', subArea: 'east' }, '2026-12-27')).toEqual(['firearms:any:dogs-no']);
  });
  it('Rockingham: Dec 1 closed for taking, hound training only', () => {
    const e = evaluate(bear, place({ county: 'Rockingham', subArea: 'east' }), '2026-12-01');
    expect(e.open.map((o) => o.rule.type)).toEqual(['chase']);
    expect(e.summary.status).toBe('closed');
  });
  it('Southwest early firearms Sep 28–30, except on Clinch Mountain WMA', () => {
    expect(open(bear, { county: 'Russell' }, '2026-09-29')).toEqual(['firearms:any:dogs-yes']);
    expect(open(bear, { county: 'Russell', land: 'dwr', property: 'Clinch Mountain WMA' }, '2026-09-29')).toEqual([]);
  });
  it('Accomack: archery and muzzleloader, but no firearms season', () => {
    expect(open(bear, { county: 'Accomack' }, '2026-10-05')).toEqual(['archery:any']);
    expect(open(bear, { county: 'Accomack' }, '2026-12-01')).toEqual([]);
  });
  it('hounds: Fairfax no; Roanoke County south of I-81 no, north yes; Campbell depends on side of the railroad', () => {
    expect(open(bear, { county: 'Fairfax' }, '2026-12-01')).toEqual(['firearms:any:dogs-no']);
    expect(open(bear, { county: 'Roanoke', subArea: 's81' }, '2026-12-01')).toEqual(['firearms:any:dogs-no']);
    expect(open(bear, { county: 'Roanoke', subArea: 'n81' }, '2026-12-01')).toEqual(['firearms:any:dogs-yes']);
    expect(open(bear, { county: 'Campbell', subArea: 'west' }, '2026-12-01')).toEqual(['firearms:any:dogs-no']);
    expect(open(bear, { county: 'Campbell', subArea: 'east' }, '2026-12-01')).toEqual(['firearms:any:dogs-yes']);
  });
  it('hounds: Wythe SE area, Grayson & Carroll east of the New River', () => {
    expect(open(bear, { county: 'Wythe', subArea: 'senr' }, '2026-12-01')).toEqual(['firearms:any:dogs-no']);
    expect(open(bear, { county: 'Wythe', subArea: 'other' }, '2026-12-01')).toEqual(['firearms:any:dogs-yes']);
    expect(open(bear, { county: 'Grayson', subArea: 'enr+e16' }, '2026-12-01')).toEqual(['firearms:any:dogs-no']);
    expect(open(bear, { county: 'Grayson', subArea: 'wnr+e16' }, '2026-12-01')).toEqual(['firearms:any:dogs-yes']);
    expect(open(bear, { county: 'Carroll', subArea: 'wnr' }, '2026-12-01')).toEqual(['firearms:any:dogs-yes']);
  });
  it('hound training: Smyth only east of Rt. 16 and north of I-81', () => {
    const chase = (sub: string) => evaluate(bear, place({ county: 'Smyth', subArea: sub }), '2026-08-15').open.map((o) => o.rule.type);
    expect(chase('n81+e16')).toEqual(['chase']);
    expect(chase('n81+w16')).toEqual([]);
    expect(chase('s81+e16')).toEqual([]);
  });
  it('youth weekend: no dogs in Smyth south of I-81 and west of Rt. 16', () => {
    const dogs = (sub: string) =>
      evaluate(bear, place({ county: 'Smyth', subArea: sub }), '2026-10-10', { includeYouth: true }).open.find((o) => o.rule.youthOnly)?.dogs;
    expect(dogs('s81+w16')).toBe('no');
    expect(dogs('s81+e16')).toBe('yes');
  });
  it('no hounds on dog-restricted WMAs', () => {
    expect(open(bear, { county: 'Amelia', land: 'dwr', property: 'Amelia WMA' }, '2026-12-01')).toEqual(['firearms:any:dogs-no']);
  });
  it('youth weekend: hounds Saturday, not Sunday', () => {
    const e = (iso: string) =>
      evaluate(bear, place({ county: 'Louisa' }), iso, { includeYouth: true }).open.filter((o) => o.rule.youthOnly).map((o) => o.dogs);
    expect(e('2026-10-10')).toEqual(['yes']);
    expect(e('2026-10-11')).toEqual(['no']);
  });
  it('Chesapeake firearms opens Oct 1', () => {
    expect(open(bear, { city: 'Chesapeake' }, '2026-10-02')).toEqual(['firearms:any:dogs-yes']);
  });
  it('state parks are "check DCR" for bear', () => {
    expect(evaluate(bear, place({ county: 'Louisa', land: 'state_park', property: 'Lake Anna State Park' }), '2026-12-01').summary.status).toBe('check');
  });
});

describe('turkey scenarios (2026-27)', () => {
  it('Rockingham fall: Oct 17–30 and Nov 26 only', () => {
    expect(open(turkey, { county: 'Rockingham', subArea: 'east' }, '2026-10-20')).toEqual(['archery:either-sex', 'firearms:either-sex:dogs-yes']);
    expect(open(turkey, { county: 'Rockingham', subArea: 'east' }, '2026-11-25')).toEqual([]);
    expect(open(turkey, { county: 'Rockingham', subArea: 'east' }, '2026-11-26')).toEqual(['firearms:either-sex:dogs-yes']);
  });
  it('Fairfax: January season', () => {
    expect(open(turkey, { county: 'Fairfax' }, '2027-01-10')).toEqual(['firearms:either-sex:dogs-yes']);
  });
  it('Suffolk closes Dec 12', () => {
    expect(open(turkey, { city: 'Suffolk', subArea: 'west' }, '2026-12-10')).toEqual(['firearms:either-sex:dogs-yes']);
    expect(open(turkey, { city: 'Suffolk', subArea: 'west' }, '2026-12-20')).toEqual([]);
  });
  it('Arlington: no fall season, spring open (bearded only)', () => {
    expect(open(turkey, { county: 'Arlington' }, '2026-10-20')).toEqual([]);
    expect(open(turkey, { county: 'Arlington' }, '2027-04-15')).toEqual(['firearms:bearded']);
  });
  it('spring hours note: noon until Apr 25', () => {
    const e = evaluate(turkey, place({ county: 'Louisa' }), '2027-04-12');
    expect(e.open[0].rule.id).toBe('turkey-spring-noon');
    expect(evaluate(turkey, place({ county: 'Louisa' }), '2027-05-01').open[0].rule.id).toBe('turkey-spring-allday');
  });
  it('fall firearms allows dogs (no Sunday restriction for turkey)', () => {
    expect(open(turkey, { county: 'Louisa' }, '2026-10-18')).toEqual(['archery:either-sex', 'firearms:either-sex:dogs-yes']);
  });
});

describe('elk scenarios (2026-27)', () => {
  it('outside the Elk Management Zone, any elk on any open deer day', () => {
    expect(open(elk, { county: 'Rockingham', subArea: 'east' }, '2026-11-20')).toEqual(['firearms:any']);
    expect(open(elk, { county: 'Fairfax' }, '2027-02-01')).toEqual(['antlerless_firearms:any', 'urban_archery:any']);
  });
  it('elk seasons line up with deer seasons day for day outside the zone', () => {
    const p = place({ county: 'Bath' });
    for (const iso of ['2026-10-02', '2026-10-03', '2026-11-13', '2026-11-14', '2026-12-12', '2026-12-13', '2027-01-03']) {
      expect(evaluate(elk, p, iso).summary.status).toBe(evaluate(deer2026, p, iso).summary.status);
    }
  });
  it('inside the zone: only the Oct 10–16 lottery hunt', () => {
    expect(open(elk, { county: 'Buchanan' }, '2026-11-20')).toEqual([]);
    const e = evaluate(elk, place({ county: 'Wise' }), '2026-10-12');
    expect(e.open.map((o) => o.take)).toEqual(['quota']);
    expect(e.summary.status).toBe('check');
  });
});
