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
