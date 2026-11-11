import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type { Land, Place } from './regs/types';
import { CITY_PARENT, regionOf, sideLabel } from './regs/virginia';

export type Poly = Feature<Polygon | MultiPolygon, Record<string, any>>;
export interface Layers {
  jurisdictions: Poly[];
  towns: Poly[];
  publicLands: Poly[];
  /** Mapped local-ordinance areas (zoning districts, subdivisions, road-bounded areas, ...). */
  localAreas: Poly[];
}

const load = async (name: string) =>
  ((await (await fetch(`${import.meta.env.BASE_URL}data/${name}.geojson`)).json()) as FeatureCollection<Polygon | MultiPolygon>)
    .features as Poly[];

export async function loadLayers(): Promise<Layers> {
  const [jurisdictions, towns, publicLands, localAreas] = await Promise.all([
    load('jurisdictions'),
    load('towns'),
    load('public-lands'),
    load('local-areas'),
  ]);
  // Each town needs the county it lies in.
  for (const t of towns) {
    const pt = interiorPoint(t);
    const j = jurisdictions.find((f) => booleanPointInPolygon(pt, f));
    t.properties.jurisdiction = j?.properties.id;
    t.properties.subArea = j?.properties.subArea;
  }
  return { jurisdictions, towns, publicLands, localAreas };
}

/** A point inside (or at least on) the polygon: bbox center if inside, else first vertex. */
function interiorPoint(f: Poly): [number, number] {
  const ring = f.geometry.type === 'Polygon' ? f.geometry.coordinates[0] : f.geometry.coordinates[0][0];
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y] of ring) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  const c: [number, number] = [(x0 + x1) / 2, (y0 + y1) / 2];
  return booleanPointInPolygon(c, f) ? c : (ring[0] as [number, number]);
}

/** Base place (no subArea) for a jurisdiction id such as 'county:Bath' or 'city:Suffolk'. */
export function placeForJurisdiction(id: string | undefined, extra: Partial<Place> = {}): Place {
  const [type, name] = (id ?? ':').split(':');
  const city = type === 'city' ? name : undefined;
  const county = type === 'city' ? CITY_PARENT[name] ?? undefined : name || undefined;
  return { county, city, region: regionOf(county, city), land: 'private', ...extra };
}

export function placeForTown(t: Poly): Place {
  return placeForJurisdiction(t.properties.jurisdiction, { town: t.properties.name, subArea: t.properties.subArea ?? undefined });
}

export function placeForPublic(f: Poly): Place {
  return placeForJurisdiction(f.properties.jurisdiction, {
    land: f.properties.land as Land,
    property: f.properties.name,
    subArea: f.properties.subArea ?? undefined,
  });
}

export function placeForArea(f: Poly): Place {
  return placeForJurisdiction(f.properties.jurisdiction, { subArea: f.properties.subArea ?? undefined, areas: [f.properties.area] });
}

export interface Located {
  place: Place;
  jurisdiction?: Poly;
  town?: Poly;
  publicLand?: Poly;
  localAreas?: Poly[];
}

/** Resolve a lon/lat to the most specific place: public land > town > county/city. */
export function locate(layers: Layers, lng: number, lat: number): Located | undefined {
  const pt: [number, number] = [lng, lat];
  const jurisdiction = layers.jurisdictions.find((f) => booleanPointInPolygon(pt, f));
  if (!jurisdiction) return undefined;
  const town = layers.towns.find((f) => booleanPointInPolygon(pt, f));
  const publicLand = layers.publicLands.find((f) => booleanPointInPolygon(pt, f));
  let place = placeForJurisdiction(jurisdiction.properties.id, { subArea: jurisdiction.properties.subArea });
  if (town) place = { ...place, town: town.properties.name };
  if (publicLand) place = { ...place, land: publicLand.properties.land, property: publicLand.properties.name };
  const localAreas = layers.localAreas.filter((f) => booleanPointInPolygon(pt, f));
  if (localAreas.length) place = { ...place, areas: [...new Set(localAreas.map((f) => f.properties.area as string))] };
  return { place, jurisdiction, town, publicLand, localAreas };
}

export function jurisdictionLabel(id: string | undefined, subArea?: string): string {
  if (!id) return '';
  const [type, name] = id.split(':');
  const base = type === 'city' ? `City of ${name}` : `${name} County`;
  const side = sideLabel(id, subArea);
  return side ? `${base} (${side[0].toLowerCase()}${side.slice(1)})` : base;
}
