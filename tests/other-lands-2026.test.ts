import { describe, expect, it } from 'vitest';
import { evaluate } from '../src/regs/engine';
import { regsFor } from '../src/regs/registry';
import type { Land, Place, Species } from '../src/regs/types';

const at = (land: Land, property: string, county: string, region: Place['region'] = 'east'): Place => ({ county, region, land, property });
const ev = (species: Species, iso: string, p: Place) => evaluate(regsFor(species, iso)!, p, iso);

describe('other public land (sources/lands)', () => {
  it('open land (POWRR, Kerr, Coalfields PALS): private-land seasons with a note', () => {
    const e = ev('deer', '2026-11-21', at('other_public', 'CF Highlands Vansant', 'Buchanan', 'west'));
    expect(e.summary.status).toBe('open');
    expect(e.info.some((i) => i.text.startsWith('POWRR property'))).toBe(true);
    expect(ev('deer', '2026-11-21', at('other_public', 'John H. Kerr Reservoir', 'Mecklenburg')).summary.status).toBe('open');
    expect(ev('deer', '2026-11-21', at('other_public', 'Coalfields PALS', 'Wise', 'west')).info.some((i) => i.text.includes('PALS permit'))).toBe(true);
  });

  it('lottery or permit land: "check", only for its species', () => {
    const nk = at('other_public', 'New Kent Forestry Center', 'New Kent');
    expect(ev('deer', '2026-11-21', nk).summary.status).toBe('check');
    expect(ev('squirrel', '2026-11-21', nk).summary.status).toBe('closed');
    expect(ev('duck', '2026-12-20', at('other_public', 'Dameron Marsh Natural Area Preserve', 'Northumberland')).summary.status).toBe('check');
  });

  it('Natural Area Preserves and POWRR no-hunting zones are closed', () => {
    const nap = ev('deer', '2026-11-21', at('other_public', 'Antioch Pines Natural Area Preserve', 'Isle of Wight'));
    expect(nap.summary.status).toBe('closed');
    expect(nap.info.map((i) => i.text)).toContain('Natural Area Preserve: closed to hunting.');
    expect(ev('deer', '2026-11-21', at('other_public', 'CF Highlands Dante - Straight Hollow Exclusion Zone (no hunting)', 'Russell', 'west')).summary.status).toBe('closed');
  });

  it('The Channels preserve (DOF-managed, inside the state forest): "check", not closed', () => {
    const e = ev('deer', '2026-11-21', at('other_public', 'The Channels Natural Area Preserve', 'Washington', 'west'));
    expect(e.summary.status).toBe('check');
    expect(e.info.some((i) => i.text.includes('Department of Forestry'))).toBe(true);
  });

  it('Banshee Reeks: Loudoun County lottery deer hunts only', () => {
    const br = at('other_public', 'Banshee Reeks Nature Preserve', 'Loudoun');
    expect(ev('deer', '2026-12-05', br).summary.status).toBe('check');
    expect(ev('turkey', '2026-11-05', br).summary.status).toBe('closed');
  });

  describe('Fairfax County deer management areas', () => {
    const fx = (name: string, areas?: string[]): Place => ({ ...at('other_public', name, 'Fairfax'), areas });
    const archery = fx('Fountainhead Regional (Fairfax County deer archery program)');

    it('archery program parks: "check" for deer (approved archers only), closed to other species', () => {
      const e = ev('deer', '2026-10-10', archery);
      expect(e.summary.status).toBe('check');
      expect(e.open.length).toBeGreaterThan(0);
      expect(e.open.every((o) => o.take === 'check')).toBe(true);
      expect(e.info.some((i) => i.text.startsWith('Fairfax County archery program: approved, qualified archers only'))).toBe(true);
      expect(ev('squirrel', '2026-10-10', archery).summary.status).toBe('closed');
    });

    it('still "check" (not open or closed) under the county firearms ordinance, incl. Appendix J areas', () => {
      expect(ev('deer', '2026-11-21', archery).summary.status).toBe('check');
      expect(ev('deer', '2027-02-01', fx('Huntley Meadows (Fairfax County deer archery program)', ['fairfax-county--appendix-j-restricted'])).summary.status).toBe('check');
    });

    it('sharpshooter-only and no-hunting areas are closed', () => {
      const e = ev('deer', '2026-10-10', fx('Lake Fairfax (Fairfax County deer program: no-hunting area)'));
      expect(e.summary.status).toBe('closed');
      expect(e.info.some((i) => i.text.includes('no public hunting'))).toBe(true);
      expect(ev('deer', '2026-10-10', fx('Green Spring Gardens (Fairfax County deer program: sharpshooters only)')).summary.status).toBe('closed');
    });
  });

  it('DWR Wildlife Conservation Sites: Weston is chase-only (closed); Jones Cove and Goochland Marsh are "check"', () => {
    const w = ev('deer', '2026-11-21', at('other_public', 'Weston Wildlife Conservation Site', 'Fauquier'));
    expect(w.summary.status).toBe('closed');
    expect(w.info.some((i) => i.text.includes('chase-only'))).toBe(true);
    expect(ev('deer', '2026-10-10', at('other_public', 'Jones Cove WCS (Mockhorn Island WMA)', 'Northampton')).summary.status).toBe('check');
    expect(ev('deer', '2026-10-10', at('other_public', 'Goochland Marsh WCS (Powhatan WMA Goochland Tract)', 'Goochland')).summary.status).toBe('check');
  });
});

describe('state parks not on DCR’s 2026-27 hunting list are closed', () => {
  it('Holliday Lake (inside Appomattox-Buckingham State Forest) is closed; listed parks unchanged', () => {
    const hl = ev('deer', '2026-11-21', at('state_park', 'Holliday Lake State Park', 'Appomattox'));
    expect(hl.summary.status).toBe('closed');
    expect(hl.info.some((i) => i.text.includes('not on DCR’s state park hunting list'))).toBe(true);
    expect(ev('deer', '2026-11-21', at('state_park', 'Fairy Stone State Park', 'Patrick', 'west')).summary.status).not.toBe('closed');
  });

  it('only for the 2026-27 list (archived years keep their own rules)', () => {
    const e = ev('deer', '2025-11-22', at('state_park', 'Holliday Lake State Park', 'Appomattox'));
    expect(e.info.some((i) => i.text.includes('not on DCR’s state park hunting list'))).toBe(false);
  });
});
