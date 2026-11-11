import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { evaluate } from '../src/regs/engine';
import { bobcat2026, coyote2026, fox2026, FURBEARERS, raccoon2026 } from '../src/regs/furbearer-2026';
import { crow2026, groundhog2026, grouse2026, quail2026, SMALL_GAME, squirrel2026 } from '../src/regs/small-game-2026';
import { SPECIES } from '../src/regs/index';
import type { Place, Selector, SpeciesRegs, Where } from '../src/regs/types';
import { regionOf } from '../src/regs/virginia';

const geo = (f: string) => JSON.parse(readFileSync(`public/data/${f}.geojson`, 'utf8')).features.map((x: any) => x.properties);
const jur = geo('jurisdictions');
const counties = new Set(jur.filter((j: any) => j.type === 'county').map((j: any) => j.name));
const cities = new Set(jur.filter((j: any) => j.type === 'city').map((j: any) => j.name));
const properties = new Set(geo('public-lands').map((p: any) => p.name));

const place = (p: Partial<Place>): Place => ({ land: 'private', region: regionOf(p.county, p.city), ...p });
const status = (regs: SpeciesRegs, p: Partial<Place>, iso: string) => evaluate(regs, place(p), iso).summary.status;
const labels = (regs: SpeciesRegs, p: Partial<Place>, iso: string) => evaluate(regs, place(p), iso).open.map((o) => o.rule.label).sort();

describe.each([...SMALL_GAME, ...FURBEARERS].map((r) => [r.species, r] as const))('%s data integrity', (_, regs) => {
  const all: Where[] = [];
  const walk = (s: Selector) => (Array.isArray(s) ? s : [s]).forEach((w) => { all.push(w); w.not?.forEach(walk); });
  [...regs.seasons.map((s) => s.where), ...regs.info.map((i) => i.where), ...(regs.dogRules ?? []).map((d) => d.where)].forEach(walk);
  const base = (n: string) => n.split('/')[0];
  it('referenced names exist in the map data', () => {
    expect([
      ...all.flatMap((w) => w.counties ?? []).map(base).filter((n) => !counties.has(n)),
      ...all.flatMap((w) => w.cities ?? []).map(base).filter((n) => !cities.has(n)),
      ...all.flatMap((w) => w.properties ?? []).filter((n) => !properties.has(n)),
    ]).toEqual([]);
  });
  it('is listed in the species picker', () => expect(SPECIES.some((s) => s.id === regs.species)).toBe(true));
});

describe('small game (2026-27)', () => {
  it('crow: Mon/Wed/Fri/Sat only', () => {
    expect(status(crow2026, { county: 'Louisa' }, '2026-11-16')).toBe('open'); // Monday
    expect(status(crow2026, { county: 'Louisa' }, '2026-11-17')).toBe('closed'); // Tuesday
    expect(status(crow2026, { county: 'Louisa' }, '2026-11-15')).toBe('closed'); // Sunday
  });
  it('crow on National Forest: Sep 2 – Mar 10', () => {
    const nf = { county: 'Bath', land: 'national_forest' as const, property: 'George Washington & Jefferson National Forest' };
    expect(status(crow2026, nf, '2026-08-17')).toBe('closed'); // Monday, before Sep 2
    expect(status(crow2026, nf, '2026-09-02')).toBe('open'); // Wednesday
  });
  it('grouse: west of I-95 only (split counties by side)', () => {
    expect(status(grouse2026, { county: 'Louisa' }, '2026-11-20')).toBe('open');
    expect(status(grouse2026, { county: 'Hanover', subArea: 'w95' }, '2026-11-20')).toBe('open');
    expect(status(grouse2026, { county: 'Hanover', subArea: 'e95' }, '2026-11-20')).toBe('closed');
    expect(status(grouse2026, { county: 'Gloucester' }, '2026-11-20')).toBe('closed');
  });
  it('quail: closed on public land west of the Blue Ridge and on Flippo-Gentry WMA', () => {
    expect(status(quail2026, { county: 'Bath' }, '2026-12-01')).toBe('open');
    expect(status(quail2026, { county: 'Bath', land: 'national_forest', property: 'George Washington & Jefferson National Forest' }, '2026-12-01')).toBe('closed');
    expect(status(quail2026, { county: 'Sussex', land: 'dwr', property: 'Flippo-Gentry WMA' }, '2026-12-01')).toBe('closed');
    expect(status(quail2026, { county: 'Sussex' }, '2026-12-01')).toBe('open');
  });
  it('squirrel: fox squirrel only in listed counties; spring season closed on National Forest', () => {
    expect(labels(squirrel2026, { county: 'Bath' }, '2026-10-01')).toEqual(['Fox squirrel', 'Gray & red squirrel']);
    expect(labels(squirrel2026, { county: 'Louisa' }, '2026-10-01')).toEqual(['Gray & red squirrel']);
    expect(status(squirrel2026, { county: 'Bath', land: 'national_forest', property: 'George Washington & Jefferson National Forest' }, '2027-06-10')).toBe('closed');
    expect(labels(squirrel2026, { county: 'Bath' }, '2027-06-10')).toEqual(['Spring fox squirrel', 'Spring gray & red squirrel']);
  });
  it('groundhog: year-round on private land, seasonal on DWR land', () => {
    expect(status(groundhog2026, { county: 'Louisa' }, '2026-07-04')).toBe('open');
    expect(status(groundhog2026, { county: 'Amelia', land: 'dwr', property: 'Amelia WMA' }, '2026-07-04')).toBe('closed');
    expect(status(groundhog2026, { county: 'Amelia', land: 'dwr', property: 'Amelia WMA' }, '2027-04-20')).toBe('open'); // spring turkey
  });
});

describe('furbearers (2026-27)', () => {
  it('bobcat: archery in October, firearms Nov 1 – Feb 28', () => {
    expect(evaluate(bobcat2026, place({ county: 'Louisa' }), '2026-10-10').summary.weapon).toBe('archery');
    expect(evaluate(bobcat2026, place({ county: 'Louisa' }), '2026-12-10').summary.weapon).toBe('firearms');
  });
  it('bobcat dogs: banned in Bath during the deer firearms season only', () => {
    const dogs = (iso: string) => evaluate(bobcat2026, place({ county: 'Bath' }), iso).summary.dogs;
    expect(dogs('2026-11-20')).toBe('no'); // deer firearms Nov 14 – Dec 12
    expect(dogs('2027-01-10')).toBe('yes');
    expect(evaluate(bobcat2026, place({ county: 'Louisa' }), '2026-11-20').summary.dogs).toBe('yes');
  });
  it('fox: firearms closed in Albemarle; gray fox only from Jan 1', () => {
    expect(labels(fox2026, { county: 'Albemarle' }, '2026-12-01')).toEqual(['Fox chase (no take)']);
    expect(status(fox2026, { county: 'Albemarle' }, '2026-12-01')).toBe('closed');
    expect(labels(fox2026, { county: 'Goochland' }, '2026-12-01')).toEqual(['Fox chase (no take)', 'Red fox']);
    expect(labels(fox2026, { county: 'Goochland' }, '2027-01-05')).toEqual(['Fox chase (no take)', 'Gray fox', 'Red fox']);
  });
  it('coyote: continuous on private land; NF/DWR only Sep 1 – Mar 10 and spring turkey', () => {
    expect(status(coyote2026, { county: 'Louisa' }, '2026-07-15')).toBe('open');
    const nf = { county: 'Bath', land: 'national_forest' as const, property: 'George Washington & Jefferson National Forest' };
    expect(status(coyote2026, nf, '2026-07-15')).toBe('closed');
    expect(status(coyote2026, nf, '2026-10-15')).toBe('open');
  });
  it('raccoon: chase-only outside Oct 15 – Mar 10', () => {
    expect(status(raccoon2026, { county: 'Louisa' }, '2026-08-01')).toBe('closed');
    expect(labels(raccoon2026, { county: 'Louisa' }, '2026-08-01')).toEqual(['Raccoon chase (no take)']);
    expect(status(raccoon2026, { county: 'Louisa' }, '2026-11-01')).toBe('open');
  });
  it('local ordinances apply: Richmond city allows bowhunting for deer only', () => {
    expect(status(raccoon2026, { city: 'Richmond' }, '2026-11-01')).toBe('closed');
  });
});
