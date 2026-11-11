/**
 * Local firearm/hunting ordinances (counties, cities, towns), as published by DWR at
 * https://dwr.virginia.gov/hunting/regulations/local-ordinances/ (snapshots in
 * sources/regs/local-ordinances/). Data: local-ordinances.json, built from those
 * pages and reviewed by hand (see scripts/ and docs/OPEN-QUESTIONS.md).
 *
 * The extracted text is shown in the location panel. Only the hand-reviewed
 * effects in local-effects.ts change what the map shows.
 */
import data from './local-ordinances.json';
import { LOCAL_CONFLICTS, LOCAL_EFFECTS, type LocalEffectRule } from './local-effects';
import type { Place, SeasonRule, SeasonType, Species } from './types';

export type LocalWeapon = 'all_firearms' | 'rifle' | 'pistol' | 'shotgun' | 'muzzleloader' | 'air_gun' | 'archery' | 'any';

export interface LocalRestriction {
  kind: string;
  scope: 'entire' | 'partial';
  area: string;
  species: (Species | 'all')[];
  weapons: LocalWeapon[];
  exceptions: string;
  dates: string;
  summary: string;
  quote: string;
  section: string;
}

export interface LocalOrdinances {
  slug: string;
  jurisdiction: string;
  url: string;
  restrictions: LocalRestriction[];
  conflicts: string[];
  notes: string;
}

export const LOCAL: LocalOrdinances[] = data as LocalOrdinances[];
const BY_ID = new Map(LOCAL.map((l) => [l.jurisdiction, l]));

/**
 * Ordinances that apply at a place: the independent city, or the county plus the
 * town the place is in. (County ordinances are assumed to apply inside towns too.)
 */
export function localFor(place: Place): LocalOrdinances[] {
  const ids = idsFor(place);
  return ids.map((id) => BY_ID.get(id)).filter((x): x is LocalOrdinances => !!x);
}

/** Hunting weapon classes, from most to least capable. 'shotgun' = firearms except rifles/pistols. */
export type WeaponClass = 'firearms' | 'shotgun' | 'muzzleloader' | 'archery' | 'none';

const SEASON_WEAPONS: Record<SeasonType, LocalWeapon[]> = {
  // State rules: muzzleloaders, arrowguns, and archery tackle may be used in firearms seasons;
  // archery tackle in muzzleloader seasons.
  // (Air guns are left out of the classes; their legality is in each species' methods text.)
  firearms: ['rifle', 'pistol', 'shotgun', 'muzzleloader', 'archery'],
  antlerless_firearms: ['rifle', 'pistol', 'shotgun', 'muzzleloader', 'archery'],
  youth: ['rifle', 'pistol', 'shotgun', 'muzzleloader', 'archery'],
  muzzleloader: ['muzzleloader', 'archery'],
  archery: ['archery'],
  urban_archery: ['archery'],
  chase: [],
};

export interface LocalEffect {
  weapon: WeaponClass;
  /** Reviewed ordinance effects that narrowed the weapons for this season. */
  applied: LocalEffectRule[];
}

const idsFor = (place: Place) =>
  place.city ? [`city:${place.city}`] : [`county:${place.county}`, ...(place.town ? [`town:${place.town}`] : [])];

/** Weapons still usable in a season at this place after locality-wide ordinances (local-effects.ts). */
export function localEffect(place: Place, species: Species, rule: Pick<SeasonRule, 'id' | 'type'>): LocalEffect {
  const ids = idsFor(place);
  let allowed = new Set(SEASON_WEAPONS[rule.type]);
  const applied: LocalEffectRule[] = [];
  for (const e of LOCAL_EFFECTS) {
    if (!ids.includes(e.jurisdiction)) continue;
    if (e.species !== 'all' && !e.species.includes(species)) continue;
    if (e.ruleIds && !e.ruleIds.includes(rule.id)) continue;
    const before = allowed.size;
    allowed = new Set([...allowed].filter((w) => !e.ban.includes(w)));
    if (allowed.size !== before) applied.push(e);
  }
  return { weapon: classOf(allowed), applied };
}

/** Local ordinances that conflict with a state season here (shown as warnings, not applied). */
export function localConflicts(place: Place, species: Species) {
  const ids = idsFor(place);
  return LOCAL_CONFLICTS.filter((c) => ids.includes(c.jurisdiction) && c.species === species);
}

function classOf(w: Set<LocalWeapon>): WeaponClass {
  if (w.has('rifle')) return 'firearms';
  if (w.has('shotgun') || w.has('pistol')) return 'shotgun';
  if (w.has('muzzleloader')) return 'muzzleloader';
  if (w.has('archery')) return 'archery';
  return 'none';
}
