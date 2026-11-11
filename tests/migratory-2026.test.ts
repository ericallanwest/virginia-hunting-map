import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { evaluate, matches } from '../src/regs/engine';
import { availableYears, GROUPS, regsFor, SPECIES } from '../src/regs/index';
import { dove2026, duck2026, goose2026, MIGRATORY, rail2026, woodcock2026 } from '../src/regs/migratory-2026';
import { crow2026 } from '../src/regs/small-game-2026';
import type { Place, SpeciesRegs } from '../src/regs/types';
import { regionOf } from '../src/regs/virginia';
import { fmtTime, hoursFor, legalWindow, sunDay } from '../src/sun';

// Dates, zones and limits: DWR Migratory Game Birds page (sources/regs/migratory-gamebirds.html),
// matching the 2026–27 Seasons Guide pp. 31–32 and the federal memorandum MGBHM–2026–02.
const place = (p: Partial<Place>): Place => ({ land: 'private', region: regionOf(p.county, p.city), ...p });
const ev = (regs: SpeciesRegs, p: Partial<Place>, iso: string, includeYouth = false) => evaluate(regs, place(p), iso, { includeYouth });
const status = (regs: SpeciesRegs, p: Partial<Place>, iso: string, includeYouth = false) => ev(regs, p, iso, includeYouth).summary.status;
const labels = (regs: SpeciesRegs, p: Partial<Place>, iso: string) => ev(regs, p, iso).open.map((o) => o.rule.label).sort();

describe('species picker', () => {
  it('has a Migratory Birds group after Furbearer with five species', () => {
    expect(GROUPS.map((g) => g.label)).toEqual(['Big Game', 'Small Game', 'Furbearer', 'Migratory Birds']);
    expect(SPECIES.filter((s) => s.group === 'mig').map((s) => s.label)).toEqual(['Dove', 'Duck', 'Goose & Swan', 'Woodcock & Snipe', 'Rail & Gallinule']);
    expect(SPECIES.find((s) => s.id === 'crow')!.group).toBe('small');
  });
  it('has no regulations before 2026–27 (the UI shows a "not available" message)', () => {
    for (const r of MIGRATORY) {
      expect(regsFor(r.species, '2025-11-20')).toBeUndefined();
      expect(regsFor(r.species, '2026-11-20')).toBe(r);
      expect(availableYears(r.species)).toEqual([2026]);
    }
  });
});

describe('Canada goose zones', () => {
  const jur = JSON.parse(readFileSync('public/data/jurisdictions.geojson', 'utf8')).features.map((f: any) => f.properties);
  const zoneRules = goose2026.seasons.filter((s) => s.label.includes('Zone'));
  const zonesAt = (p: Place) => zoneRules.filter((s) => matches(s.where, p));

  it('puts every county and city piece in one zone, or both zones with a partial note', () => {
    const problems: string[] = [];
    for (const j of jur) {
      const p = place(j.type === 'city' ? { city: j.name, subArea: j.subArea ?? undefined } : { county: j.name, subArea: j.subArea ?? undefined });
      const z = zonesAt(p);
      const ok = z.length === 1 ? !z[0].partialNote : z.length === 2 && z.every((s) => s.partialNote) && z[0].label !== z[1].label;
      if (!ok) problems.push(`${j.id}${j.subArea ? '/' + j.subArea : ''}: ${z.map((s) => s.label).join(', ')}`);
    }
    expect(problems).toEqual([]);
  });
  it.each([
    ['Loudoun', 'AP'], ['Fauquier', 'AP'], ['Hanover', 'AP'], ['Accomack', 'AP'], ['Surry', 'AP'],
    ['Clarke', 'RP'], ['Augusta', 'RP'], ['Fluvanna', 'RP'], ['Nelson', 'RP'], ['Dinwiddie', 'RP'], ['Halifax', 'RP'], ['Amelia', 'RP'],
  ])('%s County is in the %s Zone', (county, zone) => {
    const p = place({ county, subArea: county === 'Nelson' ? 'west' : undefined });
    expect(zonesAt(p).map((s) => s.label)).toEqual([`Canada & white-fronted geese — ${zone} Zone`]);
  });
  it('splits I-95 localities along I-95 between Richmond and Petersburg', () => {
    expect(zonesAt(place({ county: 'Chesterfield', subArea: 'e95' })).map((s) => s.label)).toEqual(['Canada & white-fronted geese — AP Zone']);
    expect(zonesAt(place({ county: 'Chesterfield', subArea: 'w95' })).map((s) => s.label)).toEqual(['Canada & white-fronted geese — RP Zone']);
    expect(zonesAt(place({ city: 'Virginia Beach' })).map((s) => s.label)).toEqual(['Canada & white-fronted geese — AP Zone']);
  });
  it('AP Zone: Nov 24–29 and Dec 24 – Jan 31', () => {
    const hanover = { county: 'Hanover', subArea: 'w95' };
    expect(labels(goose2026, hanover, '2026-11-23')).toEqual([]);
    expect(labels(goose2026, hanover, '2026-11-24')).toEqual(['Canada & white-fronted geese — AP Zone']);
    expect(labels(goose2026, hanover, '2026-11-29')).toEqual(['Canada & white-fronted geese — AP Zone', 'Light geese (snow & Ross’s)']);
    expect(labels(goose2026, hanover, '2026-12-20')).toEqual(['Atlantic brant', 'Light geese (snow & Ross’s)']);
    expect(labels(goose2026, hanover, '2027-01-31')).toContain('Canada & white-fronted geese — AP Zone');
    expect(labels(goose2026, hanover, '2027-02-01')).toEqual(['Light geese (snow & Ross’s)']);
  });
  it('RP Zone: Nov 18–29 and Dec 19 – Feb 21', () => {
    const halifax = { county: 'Halifax' };
    expect(labels(goose2026, halifax, '2026-11-18')).toEqual(['Canada & white-fronted geese — RP Zone']);
    expect(labels(goose2026, halifax, '2026-12-19')).toContain('Canada & white-fronted geese — RP Zone');
    expect(labels(goose2026, halifax, '2027-02-21')).toEqual(['Canada & white-fronted geese — RP Zone', 'Light geese (snow & Ross’s)']);
    expect(labels(goose2026, halifax, '2027-02-22')).toEqual(['Light geese (snow & Ross’s)']);
  });
  it('a county the zone line crosses shows each zone with its part', () => {
    const o = ev(goose2026, { county: 'Albemarle' }, '2026-11-20').open;
    expect(o.map((x) => [x.rule.label, x.rule.partialNote])).toEqual([
      ['Canada & white-fronted geese — RP Zone', 'Only the part south of I-64 (Resident Population Zone).'],
    ]);
    expect(ev(goose2026, { county: 'Albemarle' }, '2026-11-20').info.filter((i) => i.topic === 'zone').map((i) => i.text)).toContain(
      'This county is crossed by I-64: north of I-64 is the AP Zone, south is the RP Zone.',
    );
  });
});

describe('other geese, brant, swan', () => {
  it('September Canada goose Sep 1–25, not on Amelia or Dick Cross WMAs', () => {
    expect(status(goose2026, { county: 'Louisa' }, '2026-09-01')).toBe('open');
    expect(status(goose2026, { county: 'Louisa' }, '2026-09-26')).toBe('closed');
    expect(status(goose2026, { county: 'Amelia', land: 'dwr', property: 'Amelia WMA' }, '2026-09-10')).toBe('closed');
    expect(status(goose2026, { county: 'Amelia' }, '2026-09-10')).toBe('open');
  });
  it('light goose Nov 25 – Mar 10; brant Dec 19–31 and Jan 15–31', () => {
    expect(labels(goose2026, { county: 'Halifax' }, '2027-03-10')).toEqual(['Light geese (snow & Ross’s)']);
    expect(status(goose2026, { county: 'Halifax' }, '2027-03-11')).toBe('closed');
    expect(labels(goose2026, { county: 'Halifax' }, '2027-01-10')).not.toContain('Atlantic brant');
    expect(labels(goose2026, { county: 'Halifax' }, '2027-01-15')).toContain('Atlantic brant');
  });
  it('tundra swan (by permit) only east of I-95 and south of the Prince William/Stafford line', () => {
    const swan = (p: Partial<Place>) => labels(goose2026, p, '2026-12-01').includes('Tundra swan (permit holders only)');
    expect(swan({ city: 'Virginia Beach' })).toBe(true);
    expect(swan({ county: 'Accomack' })).toBe(true);
    expect(swan({ county: 'Stafford', subArea: 'e95' })).toBe(true);
    expect(swan({ county: 'Stafford', subArea: 'w95' })).toBe(false);
    expect(swan({ county: 'Prince William', subArea: 'e95' })).toBe(false);
    expect(swan({ county: 'Louisa' })).toBe(false);
    expect(ev(goose2026, { city: 'Virginia Beach' }, '2026-11-16').summary.status).toBe('check'); // swan only: permit drawing
    expect(status(goose2026, { city: 'Virginia Beach' }, '2026-11-14')).toBe('closed');
  });
});

describe('ducks', () => {
  it('September teal: Sep 19–27 east of I-95, Sep 22–27 west', () => {
    expect(status(duck2026, { county: 'Gloucester' }, '2026-09-19')).toBe('open');
    expect(status(duck2026, { county: 'Hanover', subArea: 'e95' }, '2026-09-20')).toBe('open');
    expect(status(duck2026, { county: 'Hanover', subArea: 'w95' }, '2026-09-20')).toBe('closed');
    expect(status(duck2026, { county: 'Louisa' }, '2026-09-22')).toBe('open');
    expect(status(duck2026, { county: 'Louisa' }, '2026-09-28')).toBe('closed');
  });
  it('Oct 9–12 (black duck closed), Nov 18–29, Dec 19 – Jan 31', () => {
    expect(labels(duck2026, { county: 'Louisa' }, '2026-10-12')).toEqual(['Ducks, mergansers & coots (black duck closed)']);
    expect(status(duck2026, { county: 'Louisa' }, '2026-10-13')).toBe('closed');
    expect(status(duck2026, { county: 'Louisa' }, '2026-11-18')).toBe('open');
    expect(status(duck2026, { county: 'Louisa' }, '2026-12-01')).toBe('closed');
    expect(status(duck2026, { county: 'Louisa' }, '2027-01-31')).toBe('open');
  });
  it('youth & veterans days Oct 24 and Feb 6 count only when youth days are included', () => {
    expect(status(duck2026, { county: 'Louisa' }, '2026-10-24')).toBe('closed');
    expect(status(duck2026, { county: 'Louisa' }, '2026-10-24', true)).toBe('open');
    expect(status(duck2026, { county: 'Louisa' }, '2027-02-06', true)).toBe('open');
  });
  it('scaup limit changes on Jan 12', () => {
    const scaup = (iso: string) => ev(duck2026, { county: 'Louisa' }, iso).info.filter((i) => i.text.startsWith('Scaup')).map((i) => i.text);
    expect(scaup('2027-01-11')).toEqual(['Scaup: 1 per day.']);
    expect(scaup('2027-01-12')).toEqual(['Scaup: 2 per day (Jan 12–31).']);
  });
  it('open on Sundays', () => expect(status(duck2026, { county: 'Louisa' }, '2026-11-22')).toBe('open')); // Sunday
});

describe('dove, woodcock & snipe, rails', () => {
  it('dove: Sep 5 – Oct 24, Nov 21–29, Dec 19 – Jan 18', () => {
    expect(labels(dove2026, { county: 'Louisa' }, '2026-09-05')).toEqual(['Dove — opening day (noon to sunset)']);
    expect(labels(dove2026, { county: 'Louisa' }, '2026-09-06')).toEqual(['Dove']);
    expect(status(dove2026, { county: 'Louisa' }, '2026-10-25')).toBe('closed');
    expect(status(dove2026, { county: 'Louisa' }, '2026-11-21')).toBe('open');
    expect(status(dove2026, { county: 'Louisa' }, '2027-01-18')).toBe('open');
    expect(status(dove2026, { county: 'Louisa' }, '2027-01-19')).toBe('closed');
  });
  it('dove: closed on Hog Island and Princess Anne WMAs', () => {
    expect(status(dove2026, { county: 'Surry', land: 'dwr', property: 'Hog Island WMA' }, '2026-09-10')).toBe('closed');
    expect(status(dove2026, { city: 'Virginia Beach', land: 'dwr', property: 'Princess Anne WMA' }, '2026-09-10')).toBe('closed');
    expect(status(dove2026, { county: 'Amelia', land: 'dwr', property: 'Amelia WMA' }, '2026-09-10')).toBe('open');
  });
  it('woodcock Nov 11 – Dec 1, Dec 26 – Jan 18; snipe Sep 28 – Nov 29, Dec 19 – Jan 31', () => {
    expect(labels(woodcock2026, { county: 'Louisa' }, '2026-11-11')).toEqual(['Snipe', 'Woodcock']);
    expect(labels(woodcock2026, { county: 'Louisa' }, '2026-12-01')).toEqual(['Woodcock']);
    expect(labels(woodcock2026, { county: 'Louisa' }, '2026-12-02')).toEqual([]);
    expect(labels(woodcock2026, { county: 'Louisa' }, '2027-01-19')).toEqual(['Snipe']);
    expect(labels(woodcock2026, { county: 'Louisa' }, '2027-02-01')).toEqual([]);
  });
  it('rails & gallinules Sep 5 – Oct 24, Nov 10–29', () => {
    expect(status(rail2026, { county: 'Accomack' }, '2026-09-05')).toBe('open');
    expect(status(rail2026, { county: 'Accomack' }, '2026-11-09')).toBe('closed');
    expect(status(rail2026, { county: 'Accomack' }, '2026-11-29')).toBe('open');
    expect(status(rail2026, { county: 'Accomack' }, '2026-11-30')).toBe('closed');
  });
});

describe('local ordinances', () => {
  it('Hampton: waterfowl from licensed blinds with shotguns; no dove hunting', () => {
    const o = ev(duck2026, { city: 'Hampton' }, '2026-11-20').open;
    expect(o.map((x) => x.weapon)).toEqual(['shotgun']);
    expect(status(dove2026, { city: 'Hampton' }, '2026-09-10')).toBe('closed');
  });
  it('Williamsburg and Buena Vista ban hunting birds', () => {
    expect(status(dove2026, { city: 'Williamsburg' }, '2026-09-10')).toBe('closed');
    expect(status(goose2026, { city: 'Buena Vista' }, '2026-11-20')).toBe('closed');
  });
});

describe('shooting hours', () => {
  const ruleOf = (regs: SpeciesRegs, label: string, start: string) => regs.seasons.find((s) => s.label === label && s.dates[0][0] === start)!;
  it('migratory birds: half an hour before sunrise until sunset', () => {
    for (const r of MIGRATORY) for (const s of r.seasons) if (!s.hours) expect(hoursFor(s)).toBe('until-sunset');
    expect(hoursFor(crow2026.seasons[0])).toBeUndefined();
  });
  it('dove opening day: noon until sunset', () => {
    const rule = ruleOf(dove2026, 'Dove — opening day (noon to sunset)', '09-05');
    expect(hoursFor(rule)).toBe('noon-sunset');
    const sun = sunDay('2026-09-05', 37.5407, -77.436); // Richmond
    const w = legalWindow('noon-sunset', '2026-09-05', sun);
    if (w === 'any') throw new Error('expected a window');
    expect(fmtTime(w.start)).toBe('12:00 PM');
    expect(fmtTime(w.end)).toBe(fmtTime(sun.sunset));
  });
  it('September Canada goose: until ½ hour after sunset until teal season opens on each side of I-95', () => {
    expect(hoursFor(ruleOf(goose2026, 'September Canada goose', '09-01'))).toBe('half-hour');
    expect(hoursFor(ruleOf(goose2026, 'September Canada goose', '09-19'))).toBe('until-sunset');
    expect(hoursFor(ruleOf(goose2026, 'September Canada goose', '09-22'))).toBe('until-sunset');
    const east = (iso: string) => ev(goose2026, { county: 'Gloucester' }, iso).open.map((o) => hoursFor(o.rule));
    const west = (iso: string) => ev(goose2026, { county: 'Louisa' }, iso).open.map((o) => hoursFor(o.rule));
    expect(east('2026-09-18')).toEqual(['half-hour']);
    expect(east('2026-09-19')).toEqual(['until-sunset']);
    expect(west('2026-09-21')).toEqual(['half-hour']);
    expect(west('2026-09-22')).toEqual(['until-sunset']);
  });
});
