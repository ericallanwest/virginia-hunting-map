import { describe, expect, it } from 'vitest';
import { evaluate } from '../src/regs/engine';
import { regsFor } from '../src/regs/registry';
import type { Place, Species } from '../src/regs/types';

const refuge = (property: string, where: Partial<Place>): Place => ({ region: 'east', land: 'refuge', property, ...where });
const ev = (species: Species, iso: string, p: Place) => evaluate(regsFor(species, iso)!, p, iso);

const MASON_NECK = refuge('Elizabeth Hartwell Mason Neck National Wildlife Refuge', { county: 'Fairfax' });
const FEATHERSTONE = refuge('Featherstone National Wildlife Refuge', { county: 'Prince William' });
const BACK_BAY = refuge('Back Bay National Wildlife Refuge', { city: 'Virginia Beach' });
const RAPP = (unit: string) => refuge(`Rappahannock River Valley National Wildlife Refuge — ${unit} Unit`, { county: 'Richmond' });

describe('National Wildlife Refuges (sources/refuges/refuges.json)', () => {
  it('open refuge, allowed species: state seasons, every one "check the refuge"', () => {
    const e = ev('deer', '2026-11-21', MASON_NECK);
    expect(e.summary.status).toBe('check');
    expect(e.open.length).toBeGreaterThan(0);
    expect(e.open.every((o) => o.take === 'check')).toBe(true);
    expect(e.info.some((i) => i.text.includes('potomacriverrefugehunts.recaccess.com'))).toBe(true);
  });

  it('species the refuge does not allow are closed', () => {
    const e = ev('turkey', '2026-11-21', MASON_NECK); // Mason Neck: deer only
    expect(e.summary.status).toBe('closed');
    expect(e.info.some((i) => i.text.startsWith('National Wildlife Refuge: closed to turkey hunting.'))).toBe(true);
    expect(ev('deer', '2026-11-21', FEATHERSTONE).summary.status).toBe('closed'); // waterfowl only
    expect(ev('duck', '2026-12-20', FEATHERSTONE).summary.status).toBe('check');
  });

  it('closed refuges and closed Rappahannock units', () => {
    const bb = ev('deer', '2026-11-21', BACK_BAY);
    expect(bb.summary.status).toBe('closed');
    expect(bb.info.map((i) => i.text)).toContain('National Wildlife Refuge: closed to hunting.');
    expect(ev('deer', '2026-11-21', RAPP('Island Farm')).summary.status).toBe('closed');
    expect(ev('deer', '2026-11-21', RAPP('Hutchinson')).summary.status).toBe('check');
  });

  it('outside state seasons the refuge is closed too', () => {
    expect(ev('deer', '2026-08-01', MASON_NECK).summary.status).toBe('closed');
  });
});
