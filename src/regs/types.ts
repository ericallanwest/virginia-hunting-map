/**
 * Data model for hunting regulations.
 *
 * Regulations are written as declarative rules. Each rule has a `where`
 * selector describing the places it applies to; the engine (engine.ts) matches
 * a concrete Place + date against every rule and reports what is open.
 */

export type Species = 'deer' | 'bear' | 'turkey' | 'elk';

/** Land-ownership class. 'private' also covers public land not specifically listed. */
export type Land =
  | 'private'
  | 'national_forest'
  | 'dwr' // Department-owned / managed (WMAs)
  | 'state_forest'
  | 'state_park'
  | 'army_corps'
  | 'nps'; // National Park Service (closed to hunting)

export type Region = 'east' | 'west'; // of the Blue Ridge

/** A concrete location the engine evaluates. */
export interface Place {
  /** County the location is in. For an independent city this is the county it sits within (geographically). */
  county?: string;
  /** Independent city, if the location is in one. */
  city?: string;
  /** Incorporated town, if the location is in one (towns are inside counties). */
  town?: string;
  region: Region;
  land: Land;
  /** Name of the public property (as in public-lands.geojson), if any. */
  property?: string;
  /** For jurisdictions split by a road/line (see SPLITS), which side. Undefined = unknown. */
  subArea?: string;
}

/**
 * Place selector. Geographic fields (counties, countiesInclCities, cities,
 * towns, anyCity, anyTown, statewide) are OR-ed together: the place must match at
 * least one of those that are given. The remaining fields (region, land,
 * properties) are AND-ed on top. `not` excludes places matching any listed selector.
 *
 * Jurisdiction names may carry a sub-area suffix, e.g. 'Rockingham/east'. A
 * suffixed name only matches a place whose subArea equals the suffix.
 */
export interface Where {
  statewide?: boolean;
  /** Counties (including the towns within them, which are legally part of the county). */
  counties?: string[];
  /** "In the counties (including the cities and towns within) of ...": also matches independent cities inside. */
  countiesInclCities?: string[];
  cities?: string[];
  towns?: string[];
  anyCity?: boolean;
  anyTown?: boolean;
  region?: Region;
  land?: Land[];
  properties?: string[];
  not?: Where[];
}

/** A list of selectors means "any of these". */
export type Selector = Where | Where[];

export type SeasonType =
  | 'youth'
  | 'archery'
  | 'urban_archery'
  | 'muzzleloader'
  | 'firearms'
  | 'antlerless_firearms';

export type Take = 'either-sex' | 'antlered' | 'antlerless';

/** Dates are 'MM-DD' within the license year (Jul 1 - Jun 30); see dates.ts. */
export type DateRange = [start: string, end: string];

export interface SeasonRule {
  id: string;
  species: Species;
  type: SeasonType;
  label: string;
  dates: DateRange[];
  where: Selector;
  /**
   * What may be taken. 'by-days' means antlered every day, either-sex only on
   * days given in `eitherSexDays` or by an EitherSexRule with the same `esGroup`.
   */
  take: Take | 'by-days' | 'quota';
  eitherSexDays?: DateRange[];
  esGroup?: string;
  /** Opportunity limited to youth (≤15) and apprentice license holders. */
  youthOnly?: boolean;
  notes?: string[];
  /** Fragment on the DWR deer regulations page. */
  ref?: string;
}

/** Either-sex days that apply to a group of SeasonRules (used for muzzleloader seasons). */
export interface EitherSexRule {
  esGroup: string;
  dates: DateRange[] | 'full';
  where: Selector;
}

export type InfoTopic = 'bag' | 'eab' | 'apr' | 'bonus' | 'dogs' | 'local' | 'access';

/** Static (or date-limited) facts about a place: bag limits, Earn-a-Buck, dog rules, etc. */
export interface InfoRule {
  id: string;
  species: Species;
  topic: InfoTopic;
  where: Selector;
  text: string;
  dates?: DateRange[];
}

/** A jurisdiction divided by a line the app does not (yet) have geometry for. */
export interface Split {
  jurisdiction: string; // e.g. 'county:Rockingham'
  line: string;
  parts: Record<string, string>; // subArea -> label
  /** True when the map data is already split along this line (jurisdiction features carry `subArea`). */
  mapped?: boolean;
}

export interface SpeciesRegs {
  species: Species;
  licenseYear: number; // year the license year starts (Jul 1)
  source: string;
  seasons: SeasonRule[];
  eitherSex: EitherSexRule[];
  info: InfoRule[];
  /** Public properties that follow their own posted rules when no rule names them. */
  unlistedPublicPolicy: Partial<Record<Land, { status: 'check' | 'private-rules' | 'closed'; note: string }>>;
}
