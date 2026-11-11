/**
 * Local firearm/hunting ordinances (counties, cities, towns), as published by DWR at
 * https://dwr.virginia.gov/hunting/regulations/local-ordinances/ (snapshots in
 * sources/regs/local-ordinances/). Data: local-ordinances.json, built from those
 * pages and reviewed by hand (see scripts/ and docs/OPEN-QUESTIONS.md).
 *
 * Only ordinances that apply throughout a locality ("entire") change what the map
 * shows; ones limited to part of a locality (zoning districts, setbacks, parcel
 * sizes) are listed in the location panel.
 */
import data from './local-ordinances.json';
import type { Place, SeasonType, Species } from './types';

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
  const ids = place.city ? [`city:${place.city}`] : [`county:${place.county}`, ...(place.town ? [`town:${place.town}`] : [])];
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

const BANS: Partial<Record<string, (r: LocalRestriction) => LocalWeapon[]>> = {
  no_firearm_discharge: () => ['rifle', 'pistol', 'shotgun', 'muzzleloader'],
  no_hunting: () => ['rifle', 'pistol', 'shotgun', 'muzzleloader', 'air_gun', 'archery'],
  no_rifles: (r) => (r.weapons.length ? r.weapons.filter((w) => w === 'rifle' || w === 'pistol') : ['rifle']),
  shotgun_only: () => ['rifle', 'pistol', 'air_gun'],
  archery_restriction: () => ['archery'],
  air_gun_restriction: () => ['air_gun'],
};

export interface LocalEffect {
  weapon: WeaponClass;
  /** Restrictions that narrowed the weapons for this season. */
  applied: { ord: LocalOrdinances; r: LocalRestriction }[];
}

/** Weapons still usable in a season at this place after locality-wide ordinances. */
export function localEffect(place: Place, species: Species, type: SeasonType): LocalEffect {
  let allowed = new Set(SEASON_WEAPONS[type]);
  const applied: LocalEffect['applied'] = [];
  for (const ord of localFor(place)) {
    for (const r of ord.restrictions) {
      if (r.scope !== 'entire') continue;
      if (!r.species.includes('all') && !r.species.includes(species)) continue;
      const ban = BANS[r.kind]?.(r);
      if (!ban) continue;
      const before = allowed.size;
      allowed = new Set([...allowed].filter((w) => !ban.includes(w)));
      if (allowed.size !== before) applied.push({ ord, r });
    }
  }
  return { weapon: classOf(allowed), applied };
}

function classOf(w: Set<LocalWeapon>): WeaponClass {
  if (w.has('rifle')) return 'firearms';
  if (w.has('shotgun') || w.has('pistol')) return 'shotgun';
  if (w.has('muzzleloader')) return 'muzzleloader';
  if (w.has('archery')) return 'archery';
  return 'none';
}
