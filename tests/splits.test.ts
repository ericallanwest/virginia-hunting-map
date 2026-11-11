import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { deer2026 } from '../src/regs/deer-2026';
import { evaluate } from '../src/regs/engine';
import type { Place } from '../src/regs/types';
import { regionOf, SPLITS } from '../src/regs/virginia';

const jurisdictions = JSON.parse(readFileSync('public/data/jurisdictions.geojson', 'utf8')).features;

/** Jurisdiction id + side for a lon/lat, straight from the map data. */
function at(lng: number, lat: number) {
  const f = jurisdictions.find((j: any) => booleanPointInPolygon([lng, lat], j));
  return f && `${f.properties.id}${f.properties.subArea ? '/' + f.properties.subArea : ''}`;
}

describe('split-line geometry', () => {
  // Points are chosen well away from each line.
  it('Rockingham is split along Routes 613/731', () => {
    expect(at(-78.976, 38.786)).toBe('county:Rockingham/west'); // Bergton
    expect(at(-78.92, 38.65)).toBe('county:Rockingham/west'); // Fulks Run
    expect(at(-79.08, 38.47)).toBe('county:Rockingham/west'); // north of Rt. 731
    expect(at(-78.62, 38.408)).toBe('county:Rockingham/east'); // Elkton
    expect(at(-78.97, 38.40)).toBe('county:Rockingham/east'); // Bridgewater area
    expect(at(-78.70, 38.62)).toBe('county:Rockingham/east'); // Timberville area
  });

  it('Suffolk is split along the Dismal Swamp line', () => {
    expect(at(-76.68, 36.58)).toBe('city:Suffolk/west'); // Whaleyville
    expect(at(-76.65, 36.72)).toBe('city:Suffolk/west'); // west of White Marsh Rd
    expect(at(-76.48, 36.68)).toBe('city:Suffolk/east'); // Great Dismal Swamp
    expect(at(-76.52, 36.84)).toBe('city:Suffolk/east'); // north Suffolk
  });

  it('I-81 splits Montgomery, Pulaski, Roanoke, and Washington', () => {
    expect(at(-80.40, 37.02)).toBe('county:Montgomery/s81');
    expect(at(-80.35, 37.28)).toBe('county:Montgomery/n81'); // north of Blacksburg
    expect(at(-80.75, 36.95)).toBe('county:Pulaski/s81');
    expect(at(-80.75, 37.10)).toBe('county:Pulaski/n81');
    expect(at(-80.05, 37.20)).toBe('county:Roanoke/s81');
    expect(at(-80.05, 37.38)).toBe('county:Roanoke/n81');
    expect(at(-81.95, 36.65)).toBe('county:Washington/s81');
    expect(at(-81.95, 36.82)).toBe('county:Washington/n81');
  });

  it('I-81 and Rt. 16 quarter Smyth', () => {
    expect(at(-81.40, 36.95)).toBe('county:Smyth/n81+e16');
    expect(at(-81.70, 36.90)).toBe('county:Smyth/n81+w16');
    expect(at(-81.35, 36.78)).toBe('county:Smyth/s81+e16');
    expect(at(-81.60, 36.70)).toBe('county:Smyth/s81+w16');
  });

  it('the New River and Rt. 16 divide Grayson; the New River divides Carroll', () => {
    expect(at(-80.98, 36.62)).toBe('county:Grayson/enr+e16');
    expect(at(-81.20, 36.70)).toBe('county:Grayson/wnr+e16');
    expect(at(-81.55, 36.65)).toBe('county:Grayson/wnr+w16');
    expect(at(-80.75, 36.75)).toBe('county:Carroll/enr');
    expect(at(-80.975, 36.79)).toBe('county:Carroll/wnr');
  });

  it('Wythe: the Rt. 21 / I-81 / New River / Cripple Creek area and land southeast of the river', () => {
    expect(at(-80.98, 36.92)).toBe('county:Wythe/senr'); // inside the bounded area
    expect(at(-80.86, 36.856)).toBe('county:Wythe/senr'); // southeast of the New River
    expect(at(-81.25, 37.00)).toBe('county:Wythe/other'); // north of I-81
    expect(at(-81.25, 36.90)).toBe('county:Wythe/other'); // west of Rt. 21
    expect(at(-81.12, 36.80)).toBe('county:Wythe/other'); // south of Cripple Creek, east of Rt. 21
  });

  it('the Norfolk Southern main line divides Campbell and Pittsylvania', () => {
    expect(at(-79.33, 37.2)).toBe('county:Campbell/west');
    expect(at(-79.0, 37.15)).toBe('county:Campbell/east'); // Rustburg area
    expect(at(-79.6, 36.85)).toBe('county:Pittsylvania/west');
    expect(at(-79.2, 36.8)).toBe('county:Pittsylvania/east');
  });

  it('only the mapped split jurisdictions have sides', () => {
    const ids = new Set(jurisdictions.filter((j: any) => j.properties.subArea).map((j: any) => j.properties.id));
    expect([...ids].sort()).toEqual(
      SPLITS.filter((s) => s.mapped).map((s) => s.jurisdiction).sort(),
    );
  });

  it('a point east of the Dismal Swamp line gets the Oct 1 firearms season, west does not', () => {
    const place = (lng: number, lat: number): Place => {
      const [, sub] = at(lng, lat)!.split('/');
      return { city: 'Suffolk', region: regionOf(undefined, 'Suffolk'), land: 'private', subArea: sub };
    };
    const types = (p: Place) => evaluate(deer2026, p, '2026-10-15').open.map((o) => o.rule.type).sort();
    expect(types(place(-76.48, 36.68))).toEqual(['archery', 'firearms']);
    expect(types(place(-76.68, 36.58))).toEqual(['archery']);
  });
});
