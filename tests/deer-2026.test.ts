import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { deer2026 as regs } from '../src/regs/deer-2026';
import { evaluate, matches } from '../src/regs/engine';
import type { Place, Selector, Where } from '../src/regs/types';
import { CITY_PARENT, WEST_COUNTIES, regionOf } from '../src/regs/virginia';

const geo = (f: string) => JSON.parse(readFileSync(`public/data/${f}.geojson`, 'utf8')).features.map((x: any) => x.properties);
const jurisdictions = geo('jurisdictions');
const towns = new Set(geo('towns').map((p: any) => p.name));
const properties = new Set(geo('public-lands').map((p: any) => p.name));
const counties = jurisdictions.filter((j: any) => j.type === 'county').map((j: any) => j.name);
const cities = jurisdictions.filter((j: any) => j.type === 'city').map((j: any) => j.name);

const place = (p: Partial<Place> & { county?: string; city?: string }): Place => ({
  land: 'private',
  region: regionOf(p.county, p.city),
  ...p,
});

const at = (p: Place, iso: string) => evaluate(regs, p, iso);
const labels = (p: Place, iso: string) => at(p, iso).open.map((o) => `${o.rule.type}:${o.take}`).sort();

describe('data integrity', () => {
  const selectors: Selector[] = [
    ...regs.seasons.map((s) => s.where),
    ...regs.eitherSex.map((s) => s.where),
    ...regs.info.map((s) => s.where),
  ];
  const all: Where[] = [];
  const walk = (s: Selector) => (Array.isArray(s) ? s : [s]).forEach((w) => { all.push(w); w.not?.forEach(walk); });
  selectors.forEach(walk);
  const base = (n: string) => n.split('/')[0];

  it('every referenced county exists', () => {
    const names = all.flatMap((w) => [...(w.counties ?? []), ...(w.countiesInclCities ?? [])]).map(base);
    expect(names.filter((n) => !counties.includes(n))).toEqual([]);
  });
  it('every referenced city exists', () => {
    const names = all.flatMap((w) => w.cities ?? []).map(base);
    expect(names.filter((n) => !cities.includes(n))).toEqual([]);
  });
  it('every referenced town exists', () => {
    const names = all.flatMap((w) => w.towns ?? []);
    expect(names.filter((n) => !towns.has(n))).toEqual([]);
  });
  it('referenced public properties exist in the map data (except known gaps)', () => {
    const KNOWN_MISSING: string[] = [];
    const names = all.flatMap((w) => w.properties ?? []);
    expect(names.filter((n) => !properties.has(n) && !KNOWN_MISSING.includes(n))).toEqual([]);
  });
  it('city tables cover every independent city', () => {
    expect(cities.filter((c: string) => !(c in CITY_PARENT))).toEqual([]);
  });
  it('west-of-Blue-Ridge list has 31 counties', () => expect(WEST_COUNTIES.size).toBe(31));

  it('every county has exactly one private-lands general firearms season', () => {
    const fw = regs.seasons.filter((s) => s.type === 'firearms' && s.id !== 'deer-firearms-cities-towns');
    const problems: string[] = [];
    for (const c of counties) {
      const sides = c === 'Rockingham' ? ['east', 'west'] : [undefined];
      for (const subArea of sides) {
        const n = fw.filter((s) => matches(s.where, place({ county: c, subArea }))).length;
        if (n !== 1) problems.push(`${c}${subArea ? '/' + subArea : ''}: ${n}`);
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('scenarios (2026-27)', () => {
  it('Rockingham east of 613/731, Nov 11: archery + muzzleloader, either-sex', () => {
    expect(labels(place({ county: 'Rockingham', subArea: 'east' }), '2026-11-11')).toEqual([
      'archery:either-sex',
      'muzzleloader:either-sex',
    ]);
  });
  it('Rockingham west of 613/731, Nov 11: muzzleloader is antlered only', () => {
    expect(labels(place({ county: 'Rockingham', subArea: 'west' }), '2026-11-11')).toEqual([
      'archery:either-sex',
      'muzzleloader:antlered',
    ]);
  });
  it('Bath private, Nov 7: muzzleloader either-sex day', () => {
    expect(labels(place({ county: 'Bath' }), '2026-11-07')).toContain('muzzleloader:either-sex');
  });
  it('Buchanan, Nov 20: firearms antlered only', () => {
    expect(labels(place({ county: 'Buchanan' }), '2026-11-20')).toEqual(['firearms:antlered']);
  });
  it('Henry, Nov 21 vs Nov 22', () => {
    expect(labels(place({ county: 'Henry' }), '2026-11-21')).toEqual(['firearms:either-sex']);
    expect(labels(place({ county: 'Henry' }), '2026-11-22')).toEqual(['firearms:antlered']);
  });
  it('Chesapeake, Oct 15: firearms overlaps archery', () => {
    expect(labels(place({ city: 'Chesapeake' }), '2026-10-15')).toEqual(['archery:either-sex', 'firearms:either-sex']);
  });
  it('Suffolk west of Dismal Swamp line follows the Nov 14 – Jan 2 season', () => {
    expect(labels(place({ city: 'Suffolk', subArea: 'west' }), '2026-10-15')).toEqual(['archery:either-sex']);
    expect(labels(place({ city: 'Suffolk', subArea: 'east' }), '2026-10-15')).toContain('firearms:either-sex');
  });
  it('Fairfax County, Feb 1 2027: urban archery + antlerless firearms', () => {
    const e = at(place({ county: 'Fairfax' }), '2027-02-01');
    expect(e.open.map((o) => o.rule.type).sort()).toEqual(['antlerless_firearms', 'urban_archery']);
    // Fairfax County 6-1-2(e): outside Appendix J exempted parcels nothing larger than .224 caliber
    // (archery only for deer); on exempted parcels, buckshot shotguns.
    expect(e.summary).toEqual({ status: 'open', weapon: 'archery', take: 'antlerless' });
    const exempt = at(place({ county: 'Fairfax', areas: ['fairfax-county--appendix-j-exempt'] }), '2027-02-01');
    expect(exempt.summary.weapon).toBe('shotgun');
  });
  it('Arlington, Apr 1 2027: NOVA late archery', () => {
    expect(labels(place({ county: 'Arlington' }), '2027-04-01')).toEqual(['urban_archery:antlerless']);
  });
  it('National Forest in Craig: Nov 27 either-sex, Nov 26 antlered, Dec 1 archery only', () => {
    const nf = place({ county: 'Craig', land: 'national_forest', property: 'George Washington & Jefferson National Forest' });
    expect(labels(nf, '2026-11-27')).toEqual(['firearms:either-sex']);
    expect(labels(nf, '2026-11-26')).toEqual(['firearms:antlered']);
    expect(labels(nf, '2026-12-01')).toEqual(['archery:either-sex']);
  });
  it('National Forest in Bedford: no either-sex during early muzzleloader', () => {
    const nf = place({ county: 'Bedford', land: 'national_forest', property: 'George Washington & Jefferson National Forest' });
    expect(labels(nf, '2026-11-05')).toEqual(['archery:either-sex', 'muzzleloader:antlered']);
    expect(at(nf, '2026-11-05').info.map((i) => i.id)).toContain('deer-bag-west');
  });
  it('Clarke private, Dec 20: firearms only (no late archery/muzzleloader)', () => {
    expect(labels(place({ county: 'Clarke' }), '2026-12-20')).toEqual(['firearms:either-sex']);
  });
  it('Henrico private, Mar 15 2027: antlerless-only firearms', () => {
    expect(labels(place({ county: 'Henrico' }), '2027-03-15')).toEqual(['antlerless_firearms:antlerless']);
  });
  it('Town of Blacksburg, Feb 1 2027: urban archery + Montgomery antlerless firearms', () => {
    expect(labels(place({ county: 'Montgomery', town: 'Blacksburg' }), '2027-02-01')).toEqual([
      'antlerless_firearms:antlerless',
      'urban_archery:antlerless',
    ]);
  });
  it('Big Woods State Forest, Dec 30: either-sex firearms', () => {
    expect(labels(place({ county: 'Sussex', land: 'state_forest', property: 'Big Woods' }), '2026-12-30')).toContain('firearms:either-sex');
  });
  it('Unlisted WMA: firearms flagged as check-posted-rules', () => {
    const e = at(place({ county: 'Accomack', land: 'dwr', property: "Land's End WMA" }), '2026-11-20');
    expect(e.open.map((o) => o.take)).toEqual(['check']);
    expect(e.summary.status).toBe('check');
  });
  it('Cavalier WMA, Oct 10: either-sex firearms', () => {
    expect(labels(place({ city: 'Chesapeake', land: 'dwr', property: 'Cavalier WMA' }), '2026-10-10')).toContain('firearms:either-sex');
  });
  it('Youth weekend only counts when youth is included', () => {
    const p = place({ county: 'Louisa' });
    expect(evaluate(regs, p, '2026-09-26').summary.status).toBe('closed');
    expect(evaluate(regs, p, '2026-09-26', { includeYouth: true }).summary).toMatchObject({ status: 'open', take: 'either-sex' });
  });
  it('Shenandoah National Park is closed even during firearms season', () => {
    const e = at(place({ county: 'Page', land: 'nps', property: 'Shenandoah National Park' }), '2026-11-20');
    expect(e.open).toEqual([]);
    expect(e.info.map((i) => i.id)).toContain('deer-access-nps');
  });
  it('outside the license year everything is closed', () => {
    expect(at(place({ county: 'Louisa' }), '2027-11-20').summary.status).toBe('closed');
  });
  it('place facts: Bath has APR, west bag limit, dogs prohibited', () => {
    const ids = at(place({ county: 'Bath' }), '2026-11-20').info.map((i) => i.id);
    expect(ids).toEqual(expect.arrayContaining(['deer-apr', 'deer-bag-west', 'deer-dogs-prohibited']));
    expect(ids).not.toContain('deer-eab-private');
  });
});
