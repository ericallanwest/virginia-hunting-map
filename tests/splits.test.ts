import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { deer2026 } from '../src/regs/deer-2026';
import { evaluate } from '../src/regs/engine';
import type { Place } from '../src/regs/types';
import { regionOf } from '../src/regs/virginia';

const jurisdictions = JSON.parse(readFileSync('public/data/jurisdictions.geojson', 'utf8')).features;

/** Jurisdiction id + side for a lon/lat, straight from the map data. */
function at(lng: number, lat: number) {
  const f = jurisdictions.find((j: any) => booleanPointInPolygon([lng, lat], j));
  return f && `${f.properties.id}${f.properties.subArea ? '/' + f.properties.subArea : ''}`;
}

describe('split-line geometry', () => {
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

  it('every split piece is labelled and the other jurisdictions are not', () => {
    const split = jurisdictions.filter((j: any) => j.properties.subArea).map((j: any) => `${j.properties.id}/${j.properties.subArea}`);
    expect(split.sort()).toEqual(['city:Suffolk/east', 'city:Suffolk/west', 'county:Rockingham/east', 'county:Rockingham/west']);
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
