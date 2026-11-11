import { describe, expect, it } from 'vitest';
import { evaluate } from '../src/regs/engine';
import { regsFor } from '../src/regs/registry';
import type { Place, Species } from '../src/regs/types';

const place = (county: string, property?: string): Place =>
  property ? { county, region: 'east', land: 'military', property } : { county, region: 'east', land: 'private' };
const ev = (species: Species, iso: string, p: Place) => evaluate(regsFor(species, iso)!, p, iso);

describe('military installations (DWR public lands page, "Military Areas")', () => {
  it('bases with hunting programs: state framework, every season "check the installation"', () => {
    const e = ev('deer', '2026-11-21', place('Prince William', 'Marine Corps Base Quantico'));
    expect(e.summary.status).toBe('check');
    expect(e.open.length).toBeGreaterThan(0);
    expect(e.open.every((o) => o.take === 'check')).toBe(true);
    expect(e.open.every((o) => o.dogs === undefined)).toBe(true); // base rules, not state dog rules
    expect(e.info.some((i) => i.text.includes('quantico.isportsman.net'))).toBe(true);
  });

  it('closed outside the state framework, even on a program base', () => {
    expect(ev('deer', '2026-08-01', place('Caroline', 'Fort A.P. Hill (formerly Fort Walker)')).summary.status).toBe('closed');
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
