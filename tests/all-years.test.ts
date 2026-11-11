import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { matches } from '../src/regs/engine';
import { SPECIES } from '../src/regs/index';
import { ALL_REGS } from '../src/regs/registry';
import type { Place, Selector, Where } from '../src/regs/types';
import { regionOf } from '../src/regs/virginia';

// Integrity checks that every encoded license year must pass.
const geo = (f: string) => JSON.parse(readFileSync(`public/data/${f}.geojson`, 'utf8')).features.map((x: any) => x.properties);
const jur = geo('jurisdictions');
const counties = [...new Set<string>(jur.filter((j: any) => j.type === 'county').map((j: any) => j.name))];
const cities = new Set(jur.filter((j: any) => j.type === 'city').map((j: any) => j.name));
const towns = new Set(geo('towns').map((p: any) => p.name));
const properties = new Set(geo('public-lands').map((p: any) => p.name));
const place = (p: Partial<Place>): Place => ({ land: 'private', region: regionOf(p.county, p.city), ...p });

describe.each(ALL_REGS.map((r) => [`${r.species} ${r.licenseYear}`, r] as const))('%s', (_, regs) => {
  const all: Where[] = [];
  const walk = (s: Selector) => (Array.isArray(s) ? s : [s]).forEach((w) => { all.push(w); w.not?.forEach(walk); });
  [...regs.seasons.map((s) => s.where), ...regs.eitherSex.map((e) => e.where), ...regs.info.map((i) => i.where), ...(regs.dogRules ?? []).map((d) => d.where)].forEach(walk);
  const base = (n: string) => n.split('/')[0];

  it('references only places in the map data', () => {
    expect([
      ...all.flatMap((w) => [...(w.counties ?? []), ...(w.countiesInclCities ?? [])]).map(base).filter((n) => !counties.includes(n)),
      ...all.flatMap((w) => w.cities ?? []).map(base).filter((n) => !cities.has(n)),
      ...all.flatMap((w) => w.towns ?? []).filter((n) => !towns.has(n)),
      ...all.flatMap((w) => w.properties ?? []).filter((n) => !properties.has(n)),
    ]).toEqual([]);
  });
  it('has unique season ids and is in the species picker', () => {
    const ids = regs.seasons.map((s) => s.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
    expect(SPECIES.some((s) => s.id === regs.species)).toBe(true);
  });
  it.runIf(regs.species === 'deer')('puts every county in exactly one private-land general firearms group', () => {
    const fw = regs.seasons.filter((s) => s.type === 'firearms' && !s.where.toString().includes('anyTown') && JSON.stringify(s.where).includes('"private"'));
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
