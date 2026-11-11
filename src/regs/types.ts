/**
 * Data model for hunting regulations.
 *
 * Regulations are written as declarative rules. Each rule has a `where`
 * selector describing the places it applies to; the engine (engine.ts) matches
 * a concrete Place + date against every rule and reports what is open.
 */

export type Species =
  // Big game
  | 'deer' | 'bear' | 'turkey' | 'elk'
  // Small game
  | 'squirrel' | 'rabbit' | 'grouse' | 'quail' | 'pheasant' | 'crow' | 'groundhog'
  // Furbearers
  | 'bobcat' | 'coyote' | 'fox' | 'raccoon' | 'opossum' | 'skunk';

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
  /** Mapped local-ordinance areas the place is inside (ids in local-areas.json). */
  areas?: string[];
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
  | 'antlerless_firearms'
  /** Bear hound training ("chase"): dogs may pursue, no animal may be taken. */
  | 'chase';

/**
 * What may be taken. Deer: either-sex / antlered / antlerless. Bear & elk: 'any'
 * legal animal. Spring turkey: 'bearded'. Chase seasons: 'none'.
 */
export type Take = 'either-sex' | 'antlered' | 'antlerless' | 'any' | 'bearded' | 'none';

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
  /** Open only on these days of the week (0 = Sunday … 6 = Saturday), e.g. crow. */
  weekdays?: number[];
  /** Hunting with dogs is allowed in this season (subject to the species' DogRules and Sundays). */
  dogs?: boolean;
  /** The rule covers only part of a matched jurisdiction we can't map; this says which part. */
  partialNote?: string;
  notes?: string[];
  /** Fragment on the DWR regulations page. */
  ref?: string;
}

/** Either-sex days that apply to a group of SeasonRules (used for muzzleloader seasons). */
export interface EitherSexRule {
  esGroup: string;
  dates: DateRange[] | 'full';
  where: Selector;
}

export type InfoTopic = 'bag' | 'eab' | 'apr' | 'bonus' | 'dogs' | 'hours' | 'methods' | 'local' | 'access';

/**
 * Where/when dogs may NOT be used to hunt this species. A rule with `partial`
 * covers only part of the matched jurisdictions (e.g. "south of I-81"), so the
 * answer there is "varies" rather than "no".
 */
export interface DogRule {
  where: Selector;
  dates?: DateRange[];
  /** Limit to these season types (default: all seasons that allow dogs). */
  seasonTypes?: SeasonType[];
  partial?: string;
  /** Only while a deer firearms season is open at the place (bobcat and fox dog rules). */
  duringDeerFirearms?: boolean;
  note?: string;
}

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
  dogRules?: DogRule[];
  /** Dogs may never be used on Sundays (bear and deer). */
  noDogsOnSunday?: boolean;
  /** Public properties that follow their own posted rules when no rule names them. */
  unlistedPublicPolicy: Partial<Record<Land, PublicPolicy>>;
}

/**
 * What to do on public land of a given type. Normally applied only when no
 * firearms rule names the property; `always` applies it to every season there
 * (e.g. state parks for species whose rules are county-wide).
 */
export interface PublicPolicy {
  status: 'check' | 'private-rules' | 'closed';
  note: string;
  always?: boolean;
}
