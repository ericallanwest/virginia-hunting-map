/**
 * Hand-reviewed effects of local ordinances on which hunting weapons can be used.
 *
 * local-ordinances.json holds what each DWR locality page says (shown verbatim in
 * the location panel). Only the entries here change the map. Each was checked
 * against the saved page in sources/regs/local-ordinances/<slug>.html and applies
 * throughout the locality. Rules limited to part of a locality (zoning districts,
 * subdivisions, setbacks, parcel sizes, elevated-stand requirements) are not here.
 *
 * Reading notes:
 * - A muzzleloader is a firearm, so a ban on discharging "any firearm" covers it.
 * - Archery tackle may be used during firearms and muzzleloader seasons (DWR, Legal
 *   Use of Firearms and Archery Tackle), so a firearm ban leaves those seasons open
 *   to archery unless archery is restricted too.
 * - State rules require rifles/pistols of .23 caliber or larger for deer, bear and
 *   elk. A local ban on rifles "larger than .22" therefore leaves no legal rifle for
 *   those species (turkey may still be hunted with a .22).
 * - Exceptions that need a special permit or a designated parcel are kept in `note`,
 *   not treated as open.
 */
import type { LocalWeapon } from './local';
import type { Species } from './types';

export interface LocalEffectRule {
  jurisdiction: string;
  species: Species[] | 'all';
  ban: LocalWeapon[];
  /** Only for these season rule ids (e.g. spring turkey). */
  ruleIds?: string[];
  section: string;
  note: string;
}

const FIREARMS: LocalWeapon[] = ['rifle', 'pistol', 'shotgun', 'muzzleloader'];
const ALL: LocalWeapon[] = [...FIREARMS, 'archery'];
const ALL_SPECIES: Species[] = [
  'deer', 'bear', 'turkey', 'elk', 'squirrel', 'rabbit', 'grouse', 'quail', 'pheasant', 'crow', 'groundhog',
  'bobcat', 'coyote', 'fox', 'raccoon', 'opossum', 'skunk',
];
const NOT_DEER = ALL_SPECIES.filter((s) => s !== 'deer');
const GAME_BIRDS: Species[] = ['turkey', 'grouse', 'quail', 'pheasant'];
const BIG: Species[] = ['deer', 'bear', 'elk']; // need .23 caliber+ rifles under state rules
const SPRING_TURKEY = ['turkey-spring-noon', 'turkey-spring-allday', 'turkey-youth-spring'];

const noFirearms = (jurisdiction: string, section: string, note = 'No firearm discharge anywhere in the locality.'): LocalEffectRule => ({
  jurisdiction,
  species: 'all',
  ban: FIREARMS,
  section,
  note,
});
const deerOnlyArchery = (jurisdiction: string, section: string): LocalEffectRule => ({
  jurisdiction,
  species: NOT_DEER,
  ban: ['archery'],
  section,
  note: 'Bowhunting is allowed only for deer (under the city’s urban archery rules).',
});
const noBigGameRifles = (jurisdiction: string, section: string, note: string, species: Species[] = BIG): LocalEffectRule => ({
  jurisdiction,
  species,
  ban: ['rifle'],
  section,
  note,
});

export const LOCAL_EFFECTS: LocalEffectRule[] = [
  // --- No firearm discharge (archery only where archery is allowed) -----------------
  noFirearms('county:Arlington', 'Sec. 17-5', 'No firearm (including muzzleloader) may be discharged in the county, except County-supervised deer management.'),
  noFirearms('city:Alexandria', 'Sec. 13-2-3'),
  noFirearms('city:Bristol', 'Sec. 62-37'),
  noFirearms('city:Charlottesville', 'Sec. 33-6'),
  noFirearms('city:Emporia', 'Sec. 50-61(a)', 'No firearm discharge without city manager approval.'),
  noFirearms('city:Fredericksburg', '§ 54-7', 'No firearm discharge except permitted hunting (landowner permission and a City Manager permit, § 54-7.1).'),
  noFirearms('city:Galax', '§ 107-59'),
  noFirearms('city:Harrisonburg', 'Sec. 16-6-41'),
  noFirearms('city:Hopewell', 'Sec. 37-4'),
  noFirearms('city:Lynchburg', 'Sec. 27-67(a)', 'No firearm discharge, except shotguns with shot (no slugs) on permitted farmland of 25+ acres (Sec. 27-67.1).'),
  noFirearms('city:Manassas', 'Sec. 78-181', 'No firearm discharge, except deer damage control on 5+ acre agricultural parcels.'),
  noFirearms('city:Manassas Park', 'Sec. 26-3'),
  noFirearms('city:Martinsville', 'Sec. 24-2(a)'),
  noFirearms('city:Newport News', 'Sec. 43-9'),
  noFirearms('city:Norton', 'Sec. 14-144'),
  noFirearms('city:Richmond', 'Sec. 19-327'),
  noFirearms('city:Salem', 'Sec. 58-141'),
  noFirearms('city:Waynesboro', 'Sec. 50-3', 'No firearm, air rifle, or pellet gun discharge anywhere in the city.'),
  noFirearms('city:Williamsburg', 'Sec. 10-123(a)', 'No firearm discharge, except deer hunting on tracts the city manager designates.'),
  noFirearms('city:Winchester', 'Sec. 16-7'),
  noFirearms('city:Buena Vista', 'Sec. 22-64', 'No firearm discharge except on single parcels of 9+ acres in areas the city manager designates.'),
  noFirearms('town:Ashland', 'Sec 12-27', 'No firearm discharge, except shotgun-with-shot hunting by police permit on 50+ acre parcels (Sec 12-28).'),
  noFirearms('town:Gate City', 'Sec. 16-4(a)', 'No firearm discharge without a town special permit.'),
  noFirearms('town:Rocky Mount', 'Sec. 42-17'),
  noFirearms('city:Hampton', 'Sec. 40-18'),
  noFirearms('city:Fairfax', 'Sec. 54-172'),
  { jurisdiction: 'city:Radford', species: ['deer'], ban: FIREARMS, section: 'Sec. 70-47', note: 'City deer hunting is archery-only (no guns of any type during hunting hours).' },

  // --- No hunting at all -----------------------------------------------------------
  { jurisdiction: 'city:Falls Church', species: 'all', ban: ALL, section: 'Sec. 28-212', note: 'Hunting is unlawful within the city.' },
  { jurisdiction: 'city:Fairfax', species: 'all', ban: ALL, section: 'Sec. 54-175', note: 'Hunting with any weapon is prohibited unless authorized by city council.' },
  { jurisdiction: 'city:Hampton', species: 'all', ban: ALL, section: 'Sec. 40-18(b)', note: 'Hunting is prohibited except waterfowl from licensed blinds or under a state wildlife-reduction permit.' },
  { jurisdiction: 'city:Buena Vista', species: [...GAME_BIRDS, 'crow'], ban: ALL, section: 'Sec. 6-131(b)(1)', note: 'Hunting any wild bird (including turkey) is prohibited in the city.' },
  { jurisdiction: 'city:Williamsburg', species: GAME_BIRDS, ban: ALL, section: 'Sec. 4-10', note: 'The city is a bird sanctuary: no killing game birds, including turkey.' },

  // --- Archery limits ---------------------------------------------------------------
  { jurisdiction: 'city:Bristol', species: 'all', ban: ['archery'], section: 'Sec. 62-36', note: 'Bows and crossbows may only be shot on approved archery ranges.' },
  { jurisdiction: 'city:Buena Vista', species: 'all', ban: ['archery'], section: 'Sec. 22-65(a)', note: 'Arrows may only be shot in city-manager-designated areas on 9+ acre parcels.' },
  deerOnlyArchery('city:Charlottesville', 'Sec. 33-9(d)'),
  deerOnlyArchery('city:Richmond', 'Sec. 19-328(d)'),
  deerOnlyArchery('city:Martinsville', 'Sec. 24-6(a)'),
  deerOnlyArchery('city:Salem', 'Sec. 14-4'),
  deerOnlyArchery('city:Winchester', 'Sec. 16-9(a)(1)'),
  deerOnlyArchery('city:Lynchburg', 'Sec. 27-67.3(a)'),
  deerOnlyArchery('town:Rocky Mount', 'Sec. 42-18'),

  // --- No rifles (shotguns / muzzleloaders still OK) ---------------------------------
  noBigGameRifles('county:Charles City', 'Sec. 32-11', 'No rifle for deer except muzzleloaders; no rifle larger than .22 rimfire otherwise.'),
  noBigGameRifles('county:Chesterfield', 'Sec. 14-12', 'No rifles (other than muzzleloaders) for deer or turkey.', ['deer', 'turkey']),
  noBigGameRifles('county:New Kent', 'Sec. 46-225', 'Only muzzleloading rifles may be used for big game.', ['deer', 'bear', 'turkey', 'elk']),
  noBigGameRifles('county:Northampton', '§ 95.03(B)', 'No rifle for deer except qualifying muzzleloaders.', ['deer']),
  noBigGameRifles('county:Southampton', 'Sec. 10-26(a)', 'No rifle larger than .22 rimfire (and no muzzleloading rifles, Sec. 10-26(b); muzzleloading shotguns are still allowed).'),
  noBigGameRifles('city:Virginia Beach', 'Sec. 38-3(c)', 'No firearm larger than .22 caliber, except black-powder muzzleloading rifles for deer. Read as applying to rifles and pistols, since 38-3(a) expressly allows shotguns.'),
  noBigGameRifles('county:Caroline', 'Sec. 56-1', 'No rifle or pistol larger than .22 rimfire, except centerfire for deer from an elevated platform at least 8 ft high.', ['bear', 'elk']),
  noBigGameRifles('county:York', 'Sec. 16-37', 'No rifle larger than .22 rimfire may be discharged anywhere in the county.'),
  noBigGameRifles('city:Poquoson', 'Sec. 54-202', 'No rifle except .22 rimfire; muzzleloading rifles only from a stand at least 10 ft high.'),
  noBigGameRifles('county:Prince William', 'Sec. 31-22', 'No rifle larger than .22 caliber for hunting; muzzleloading rifles allowed in season.'),
  noBigGameRifles('county:King and Queen', 'Sec. 6-5(a)', 'No rifle larger than .22 caliber; muzzleloading rifles allowed except for spring gobbler.'),
  noBigGameRifles('city:Franklin', '§ 31-4(a)(5)', 'Only shotguns, pistols, or rifles of .22 caliber or smaller.'),
  {
    jurisdiction: 'county:Fairfax',
    species: BIG,
    ban: ['rifle', 'pistol', 'muzzleloader'],
    section: 'Section 6-1-2(d), (e)',
    note: 'No firearm larger than .224 caliber and no slugs; firearm deer hunting only with buckshot on parcels exempted in Appendix J.',
  },
  { jurisdiction: 'county:Halifax', species: ['turkey'], ban: ['rifle'], ruleIds: SPRING_TURKEY, section: '2025-11 Ordinance, Section 3', note: 'No rifles for spring turkey.' },
  { jurisdiction: 'county:King and Queen', species: ['turkey'], ban: ['rifle'], ruleIds: SPRING_TURKEY, section: 'Sec. 6-5(a)', note: 'No muzzleloading rifles for spring gobbler (and no rifles larger than .22).' },
  { jurisdiction: 'county:Sussex', species: ['turkey'], ban: ['rifle'], section: 'Sec. 4-159(b)', note: 'No rifle of any type, including muzzleloading rifles, for turkey.' },
  { jurisdiction: 'county:Northumberland', species: ['turkey'], ban: ['rifle'], section: '§ 83-4C', note: 'Rifles may not be used to hunt turkey.' },
  noBigGameRifles('county:Northumberland', '§ 83-3', 'Rifles larger than .22 rimfire are authorized only for deer (from stands); none for bear.', ['bear']),
  noBigGameRifles('county:Lancaster', 'Sec. 10-68', 'Rifles larger than .22 are authorized only for deer (from stands), groundhogs, and coyotes — so not for bear (inferred).', ['bear']),
];

/**
 * Ordinances that conflict with a state season and are shown as a warning rather than
 * applied: the state-run hunt is the authority hunters will be following.
 */
export const LOCAL_CONFLICTS: { jurisdiction: string; species: Species; section: string; note: string }[] = [
  {
    jurisdiction: 'county:Buchanan',
    species: 'elk',
    section: 'Sec. 22-28',
    note: 'Buchanan County’s ordinance prohibits killing elk with any firearm, muzzleloader, or bow, but DWR runs its lottery elk hunt in the county. Confirm with DWR before hunting.',
  },
];
