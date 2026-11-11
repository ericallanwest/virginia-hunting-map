import type { Region, Split } from './types';

/** Counties west of the Blue Ridge, as DWR groups them for deer seasons and bag limits. */
export const WEST_COUNTIES = new Set([
  'Alleghany', 'Augusta', 'Bath', 'Bland', 'Botetourt', 'Buchanan', 'Carroll', 'Clarke',
  'Craig', 'Dickenson', 'Floyd', 'Frederick', 'Giles', 'Grayson', 'Highland', 'Lee',
  'Montgomery', 'Page', 'Pulaski', 'Roanoke', 'Rockbridge', 'Rockingham', 'Russell',
  'Scott', 'Shenandoah', 'Smyth', 'Tazewell', 'Warren', 'Washington', 'Wise', 'Wythe',
]);

/**
 * Independent cities -> the county they sit within (used for rules phrased
 * "in the counties (including the cities and towns within) of ...").
 * null = the city is not inside any county (consolidated cities).
 */
export const CITY_PARENT: Record<string, string | null> = {
  Alexandria: 'Fairfax',
  Bristol: 'Washington',
  'Buena Vista': 'Rockbridge',
  Charlottesville: 'Albemarle',
  Chesapeake: null,
  'Colonial Heights': 'Chesterfield',
  Covington: 'Alleghany',
  Danville: 'Pittsylvania',
  Emporia: 'Greensville',
  Fairfax: 'Fairfax',
  'Falls Church': 'Fairfax',
  Franklin: 'Southampton',
  Fredericksburg: 'Spotsylvania',
  Galax: 'Carroll',
  Hampton: null,
  Harrisonburg: 'Rockingham',
  Hopewell: 'Prince George',
  Lexington: 'Rockbridge',
  Lynchburg: 'Campbell',
  Manassas: 'Prince William',
  'Manassas Park': 'Prince William',
  Martinsville: 'Henry',
  'Newport News': null,
  Norfolk: null,
  Norton: 'Wise',
  Petersburg: 'Dinwiddie',
  Poquoson: 'York',
  Portsmouth: null,
  Radford: 'Montgomery',
  Richmond: 'Henrico',
  Roanoke: 'Roanoke',
  Salem: 'Roanoke',
  Staunton: 'Augusta',
  Suffolk: null,
  'Virginia Beach': null,
  Waynesboro: 'Augusta',
  Williamsburg: 'James City',
  Winchester: 'Frederick',
};

export function regionOf(county: string | undefined, city: string | undefined): Region {
  const c = city ? CITY_PARENT[city] ?? undefined : county;
  return c && WEST_COUNTIES.has(c) ? 'west' : 'east';
}

/**
 * Jurisdictions the regulations divide along a road or line. `mapped` ones are
 * split in the map data (scripts/split-jurisdictions.py); for the rest the UI
 * asks the user which side they are on (these only affect EAB and dog rules).
 */
export const SPLITS: Split[] = [
  {
    jurisdiction: 'county:Rockingham',
    line: 'Routes 613 and 731',
    parts: { west: 'West of Rts. 613 & 731', east: 'East of Rts. 613 & 731' },
    mapped: true,
  },
  {
    jurisdiction: 'city:Suffolk',
    line: 'the Dismal Swamp line',
    parts: { east: 'East of the Dismal Swamp line', west: 'West of the Dismal Swamp line' },
    mapped: true,
  },
  {
    jurisdiction: 'county:Amherst',
    line: 'Route 29 (Earn-a-Buck and dog rules only)',
    parts: { west: 'West of Rt. 29', east: 'East of Rt. 29' },
  },
  {
    jurisdiction: 'county:Campbell',
    line: 'the Norfolk Southern Railroad (dog rules only)',
    parts: { west: 'West of the railroad', east: 'East of the railroad' },
  },
  {
    jurisdiction: 'county:Pittsylvania',
    line: 'the Norfolk Southern Railroad (dog rules only)',
    parts: { west: 'West of the railroad', east: 'East of the railroad' },
  },
  {
    jurisdiction: 'county:Nelson',
    line: 'Route 151 (dog rules only)',
    parts: { west: 'West of Rt. 151', east: 'East of Rt. 151' },
  },
];

export const splitFor = (jurisdictionId: string) => SPLITS.find((s) => s.jurisdiction === jurisdictionId);
