import { describe, expect, it } from 'vitest';
import { evaluate, weekday } from '../src/regs/engine';
import { BASE_REGS, HUNTING_PROGRAMS } from '../src/regs/military';
import { regsFor } from '../src/regs/registry';
import type { Place, Species } from '../src/regs/types';

const place = (county: string, property?: string): Place =>
  property ? { county, region: 'east', land: 'military', property } : { county, region: 'east', land: 'private' };
const ev = (species: Species, iso: string, p: Place) => evaluate(regsFor(species, iso)!, p, iso);

const QUANTICO = place('Prince William', 'Marine Corps Base Quantico');
const AP_HILL = place('Caroline', 'Fort A.P. Hill (formerly Fort Walker)');
const PICKETT = place('Nottoway', 'Fort Pickett (formerly Fort Barfoot)');
const BELVOIR = place('Fairfax', 'Fort Belvoir');
const EUSTIS: Place = { city: 'Newport News', region: 'east', land: 'military', property: 'Joint Base Langley-Eustis - Fort Eustis' };

describe('military installations (DWR public lands page, "Military Areas")', () => {
  it('bases with hunting programs, species without base seasons: state framework, every season "check the installation"', () => {
    const e = ev('coyote', '2026-11-21', QUANTICO);
    expect(e.summary.status).toBe('check');
    expect(e.open.length).toBeGreaterThan(0);
    expect(e.open.every((o) => o.take === 'check')).toBe(true);
    expect(e.open.every((o) => o.dogs === undefined)).toBe(true); // base rules, not state dog rules
    expect(e.info.some((i) => i.text.includes('quantico.isportsman.net'))).toBe(true);
  });

  it('closed outside the state framework, even on a program base', () => {
    expect(ev('deer', '2026-08-01', AP_HILL).summary.status).toBe('closed');
  });

  it('other DoD land: no public hunting', () => {
    const e = ev('deer', '2026-11-21', place('York', 'Naval Weapons Station Yorktown'));
    expect(e.summary.status).toBe('closed');
    expect(e.open).toHaveLength(0);
    expect(e.info.map((i) => i.text)).toContain('Military installation: no public hunting.');
    expect(ev('dove', '2026-09-06', place('York', 'Naval Weapons Station Yorktown')).summary.status).toBe('closed');
  });

  it('private land in the same county is unaffected', () => {
    const e = ev('deer', '2026-11-21', place('Prince William'));
    expect(e.summary.status).not.toBe('check');
    expect(e.info.some((i) => i.text.includes('Military installation'))).toBe(false);
  });
});

describe('bases’ own 2026-27 seasons (military-2026.ts)', () => {
  it('weekdays used below', () => {
    expect(['2026-11-15', '2026-11-16', '2026-11-17', '2026-11-19', '2026-11-11', '2026-12-05', '2027-01-02'].map(weekday)).toEqual([0, 1, 2, 4, 3, 6, 6]);
  });

  it('every base entry names a program base; rule ids are unique', () => {
    for (const b of BASE_REGS) expect(Object.keys(HUNTING_PROGRAMS)).toContain(b.installation);
    const ids = BASE_REGS.flatMap((b) => b.seasons.map((s) => s.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('base seasons replace the state framework and cite the base regulation', () => {
    const e = ev('deer', '2026-11-21', QUANTICO);
    expect(e.summary.status).toBe('open');
    expect(e.open.map((o) => o.rule.id)).toEqual(['mcbq-deer-3']);
    expect(e.open[0].note).toContain('MCBQ Bulletin 5-26');
    expect(e.open[0].note).toContain('Installation permit');
    expect(e.info.some((i) => i.text.includes('Seasons shown are the base’s own, from MCBQ Bulletin 5-26'))).toBe(true);
  });

  it('open under state rules but closed on the base', () => {
    // Fort Pickett has no archery bear season (Oct 6 is a Tuesday, a Pickett hunting day).
    expect(ev('bear', '2026-10-06', place('Nottoway')).summary.status).toBe('open');
    expect(ev('bear', '2026-10-06', PICKETT).summary.status).toBe('closed');
    // Quantico's rabbit season ends Jan 31 (state: Feb 28). Feb 13 is a Saturday.
    expect(ev('rabbit', '2027-02-13', place('Prince William')).summary.status).toBe('open');
    expect(ev('rabbit', '2027-02-13', QUANTICO).summary.status).toBe('closed');
    // Quantico has no muzzleloader season or extended (antlerless) deer seasons.
    expect(ev('deer', '2026-09-10', place('Prince William')).summary.status).toBe('open');
    expect(ev('deer', '2026-09-10', QUANTICO).summary.status).toBe('closed');
    // Quantico closes quail outright.
    expect(ev('quail', '2026-11-21', place('Prince William')).summary.status).toBe('open');
    const q = ev('quail', '2026-11-21', QUANTICO);
    expect(q.summary.status).toBe('closed');
    expect(q.info.some((i) => i.text.includes('Closed on this base'))).toBe(true);
    // Holidays: Quantico is closed Thanksgiving (Thu) though Thursday is a hunting day.
    expect(ev('deer', '2026-11-26', QUANTICO).summary.status).toBe('closed');
    expect(ev('deer', '2026-11-27', QUANTICO).summary.status).toBe('open');
    // A.P. Hill is closed Christmas Eve and Christmas Day.
    expect(ev('deer', '2026-12-24', AP_HILL).summary.status).toBe('closed');
  });

  it('weekday closures', () => {
    // Quantico: no Tuesdays or Wednesdays, except Nov 11 (Veterans Day); Sundays open.
    expect(ev('deer', '2026-11-17', QUANTICO).summary.status).toBe('closed');
    expect(ev('deer', '2026-11-18', QUANTICO).summary.status).toBe('closed');
    expect(ev('deer', '2026-11-15', QUANTICO).summary.status).toBe('open');
    const vd = ev('deer', '2026-11-11', QUANTICO);
    expect(vd.summary).toMatchObject({ status: 'open', weapon: 'archery', take: 'either-sex' });
    // A.P. Hill: no Sunday hunting.
    expect(ev('deer', '2026-11-15', AP_HILL).summary.status).toBe('closed');
    expect(ev('deer', '2026-11-16', AP_HILL).summary.status).toBe('open');
    // Fort Pickett: Tuesday – Saturday only.
    expect(ev('deer', '2026-11-15', PICKETT).summary.status).toBe('closed');
    expect(ev('deer', '2026-11-16', PICKETT).summary.status).toBe('closed');
    expect(ev('deer', '2026-11-17', PICKETT).summary.status).toBe('open');
    // Species days within the base's: Pickett quail Tue/Thu/Sat only.
    expect(ev('quail', '2026-11-17', PICKETT).summary.status).toBe('open');
    expect(ev('quail', '2026-11-18', PICKETT).summary.status).toBe('closed');
  });

  it('Quantico firearms deer: buck-only except Dec 5 and Jan 2; no rifles', () => {
    const buck = ev('deer', '2026-11-21', QUANTICO);
    expect(buck.summary).toMatchObject({ status: 'open', take: 'antlered', weapon: 'shotgun' });
    expect(ev('deer', '2026-12-05', QUANTICO).summary).toMatchObject({ status: 'open', take: 'either-sex' });
    expect(ev('deer', '2027-01-02', QUANTICO).summary).toMatchObject({ status: 'open', take: 'either-sex' });
    expect(ev('deer', '2026-12-06', QUANTICO).summary.take).toBe('antlered');
    // State rules for Prince William private land are either-sex that day.
    expect(ev('deer', '2026-11-21', place('Prince William')).summary.take).toBe('either-sex');
  });

  it('Fort Belvoir: archery only', () => {
    for (const iso of ['2026-09-10', '2026-11-21', '2026-12-05', '2027-01-15']) {
      const e = ev('deer', iso, BELVOIR);
      expect(e.summary.status).toBe('open');
      expect(e.summary.weapon).toBe('archery');
      expect(e.open.every((o) => o.weapon === 'archery')).toBe(true);
    }
    expect(ev('deer', '2026-09-10', BELVOIR).summary.take).toBe('antlerless');
    expect(ev('deer', '2026-11-21', BELVOIR).summary.take).toBe('either-sex');
    // The state's Fairfax seasons include muzzleloader and firearms; the base's don't.
    expect(ev('deer', '2026-11-07', place('Fairfax')).open.some((o) => o.rule.type === 'muzzleloader')).toBe(true);
    expect(ev('deer', '2026-11-07', BELVOIR).open.map((o) => o.rule.type)).toEqual(['archery']);
    expect(ev('turkey', '2026-12-01', BELVOIR).summary).toMatchObject({ status: 'open', weapon: 'archery' });
  });

  it('falls back to the state framework where the base has no seasons for the species, or the year', () => {
    // Species not encoded (Quantico coyote; A.P. Hill rabbit follows the state).
    const r = ev('rabbit', '2026-11-22', AP_HILL);
    expect(r.summary.status).toBe('check');
    expect(r.open.every((o) => o.take === 'check' && o.note?.includes('Dates shown are the state framework'))).toBe(true);
    // Base with no encoded seasons at all (Fort Eustis follows DWR); its 2026-27 note is shown.
    const fe = ev('deer', '2026-11-21', EUSTIS);
    expect(fe.summary.status).toBe('check');
    expect(fe.info.some((i) => i.text.includes('Island Creek'))).toBe(true);
    // Archived year: no base data, state framework.
    const old = ev('deer', '2025-11-22', QUANTICO);
    expect(old.summary.status).toBe('check');
    expect(old.open.every((o) => o.take === 'check')).toBe(true);
    expect(ev('deer', '2025-11-18', QUANTICO).summary.status).toBe('check'); // a Tuesday: not applied without base data
  });
});
