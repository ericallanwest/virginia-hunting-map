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
  /** Applies only inside this mapped area (local-areas.json); omitted = the whole locality. */
  area?: string;
  /** Does not apply inside these mapped areas. */
  exceptAreas?: string[];
  species: Species[] | 'all';
  ban: LocalWeapon[];
  /** Only for these season rule ids (e.g. spring turkey). */
  ruleIds?: string[];
  section: string;
  note: string;
}

const FIREARMS: LocalWeapon[] = ['rifle', 'pistol', 'shotgun', 'muzzleloader'];
const FAIRFAX_EXEMPT = 'fairfax-county--appendix-j-exempt';
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
    // 6-1-2(e): outside Appendix J exempted parcels nothing larger than .224 caliber (no legal big-game
    // firearm); on exempted parcels, shotguns with multiple ball shot (buckshot) only.
    jurisdiction: 'county:Fairfax',
    species: BIG,
    ban: FIREARMS,
    exceptAreas: [FAIRFAX_EXEMPT],
    section: 'Section 6-1-2(e)',
    note: 'No firearm larger than .224 caliber except shotguns with buckshot on parcels exempted in Appendix J.',
  },
  {
    jurisdiction: 'county:Fairfax',
    area: FAIRFAX_EXEMPT,
    species: BIG,
    ban: ['rifle', 'pistol', 'muzzleloader'],
    section: 'Section 6-1-2(d), (e)',
    note: 'Appendix J exempted area: shotguns with buckshot only (no slugs, rifles, or muzzleloaders), on qualifying posted parcels.',
  },
  { jurisdiction: 'county:Halifax', species: ['turkey'], ban: ['rifle'], ruleIds: SPRING_TURKEY, section: '2025-11 Ordinance, Section 3', note: 'No rifles for spring turkey.' },
  { jurisdiction: 'county:King and Queen', species: ['turkey'], ban: ['rifle'], ruleIds: SPRING_TURKEY, section: 'Sec. 6-5(a)', note: 'No muzzleloading rifles for spring gobbler (and no rifles larger than .22).' },
  { jurisdiction: 'county:Sussex', species: ['turkey'], ban: ['rifle'], section: 'Sec. 4-159(b)', note: 'No rifle of any type, including muzzleloading rifles, for turkey.' },
  { jurisdiction: 'county:Northumberland', species: ['turkey'], ban: ['rifle'], section: '§ 83-4C', note: 'Rifles may not be used to hunt turkey.' },
  noBigGameRifles('county:Northumberland', '§ 83-3', 'Rifles larger than .22 rimfire are authorized only for deer (from stands); none for bear.', ['bear']),
  noBigGameRifles('county:Lancaster', 'Sec. 10-68', 'Rifles larger than .22 are authorized only for deer (from stands), groundhogs, and coyotes — so not for bear (inferred).', ['bear']),
];

// --- Mapped areas (local-areas.json; built from county/city GIS, see the manifests) -----
const inArea = (area: string, jurisdiction: string, ban: LocalWeapon[], section: string, note: string, species: LocalEffectRule['species'] = 'all'): LocalEffectRule => ({
  jurisdiction,
  area,
  species,
  ban,
  section,
  note,
});

LOCAL_EFFECTS.push(
  inArea('chesapeake-city--north', 'city:Chesapeake', FIREARMS, 'Sec. 46-42(a)', 'Northern Chesapeake: no firearm discharge, except shotguns with pellets on 50+ acre tracts with a police permit.'),
  inArea('virginia-beach-city--north-of-trace-line', 'city:Virginia Beach', ALL, 'Sec. 38-3(a), 38-3.2(a)', 'North/west of the trace line: no firearms or bows (permitted shotgun-with-pellets use on farmland excepted).'),
  inArea('franklin-city--south-of-armory', 'city:Franklin', FIREARMS, '§ 31-4(a)', 'South of Armory Drive and Second Avenue: no firearm discharge, except limited December deer days or permitted still hunting.'),
  inArea('loudoun-county--east', 'county:Loudoun', ['rifle'], '684.03(a)', 'Eastern Loudoun: no centerfire rifles — deer only with handguns, shotguns, or single-projectile muzzleloaders; other game with .22 rimfire or smaller.', BIG),
  inArea('albemarle-county--residential-districts', 'county:Albemarle', FIREARMS, 'Sec. 10-107', 'Residential zoning district: no firearm discharge.'),
  inArea('henrico-county--res-ind-com-districts', 'county:Henrico', ALL, 'Sec. 13-59, 13-61', 'Residential, industrial, or commercial zoning district: no firearm or bow discharge.'),
  inArea('essex-county--r2-districts', 'county:Essex', FIREARMS, 'Sec. 22-5', 'R-2 residential district: no firearm (or crossbow) discharge.'),
  inArea('essex-county--named-subdivisions', 'county:Essex', FIREARMS, 'Sec. 22-5', 'Named subdivision: no firearm (or crossbow) discharge.'),
  inArea('petersburg-city--non-agricultural', 'city:Petersburg', FIREARMS, 'Sec. 74-208', 'Outside agricultural zoning: no firearm discharge.'),
  inArea('petersburg-city--agricultural-zoning', 'city:Petersburg', ['rifle', 'pistol', 'muzzleloader'], 'Sec. 74-209', 'Agricultural zoning: shotgun hunting only.'),
  inArea('james-city-county--subdivisions-50ft', 'county:James City', FIREARMS, 'Sec. 15-36(a)', 'In or within 50 ft of a recorded subdivision: no firearm discharge.'),
  inArea('mecklenburg-county--merrifield-acres', 'county:Mecklenburg', FIREARMS, 'Sec. 46-124', 'Merrifield Acres and adjacent Corps land: no firearm discharge.'),
  inArea('middlesex-county--piankatank-shores', 'county:Middlesex', FIREARMS, 'Sec. 22-51', 'Piankatank Shores: no firearm discharge.'),
  inArea('surry-county--surry-landing', 'county:Surry', ALL, 'Sec. 20-99(a)', 'Surry Landing on the James: no hunting.'),
  inArea('warren-county--designated-subdivisions', 'county:Warren', ALL, '§ 110-1', 'Designated subdivision/area: no hunting.'),
  inArea('fairfax-county--appendix-j-restricted', 'county:Fairfax', FIREARMS, 'Section 6-1-2(a)', 'Appendix J heavily populated area: no firearm discharge.'),
  inArea('stafford-county--shooting-prohibited', 'county:Stafford', FIREARMS, 'Sec. 26-17, 26-18', 'Shooting-prohibited area: no firearm discharge.'),
  inArea('gloucester-county--wicomico-hayes', 'county:Gloucester', FIREARMS, 'Sec. 13-14', 'Wicomico/Hayes area: no firearm discharge.'),
  inArea('gloucester-county--gloucester-point-sanitary-district', 'county:Gloucester', FIREARMS, 'Sec. 13-15', 'Gloucester Point sanitary district: no firearm discharge.'),
  // Public property
  inArea('amherst-county--county-parks', 'county:Amherst', ALL, 'Sec. 12-26(B)(3), (C)', 'County park: no hunting or firearm discharge.'),
  inArea('loudoun-county--county-parks', 'county:Loudoun', FIREARMS, '684.04(a)(2)', 'County park: possessing or carrying firearms is prohibited (so no firearm hunting).'),
  inArea('roanoke-county--county-parks', 'county:Roanoke', ALL, 'Sec. 15-7(5)', 'County park: no hunting.'),
  inArea('tazewell-county--county-parks', 'county:Tazewell', FIREARMS, 'Sec. 14-32', 'County park or parkway: no firearm discharge.'),
  inArea('stafford-county--public-property', 'county:Stafford', ALL, 'Sec. 26-10', 'County or school property: no hunting.'),
  inArea('chesapeake-city--city-parks', 'city:Chesapeake', ALL, 'Sec. 50-14', 'City park: no hunting.'),
  inArea('salem-city--city-property', 'city:Salem', ALL, 'Sec. 14-4(15)', 'City-owned property: no hunting.'),
  inArea('manassas-park-city--city-land', 'city:Manassas Park', ALL, 'Sec. 17-39.1', 'City-owned land: no hunting.'),
  inArea('norfolk-city--cemeteries', 'city:Norfolk', ALL, 'Sec. 12-34', 'City cemetery: no hunting.'),
  inArea('portsmouth-city--cemeteries', 'city:Portsmouth', ALL, 'Sec. 9-54', 'City cemetery: no hunting.'),
  inArea('spotsylvania-county--reservoirs', 'county:Spotsylvania', ALL, 'Sec. 22-241', 'Ni River / Hunting Run Reservoir: no hunting.'),
  inArea('greensville-county--meherrin-dam', 'county:Greensville', ALL, 'Sec. 20-4(a)', 'Meherrin River within 4,800 ft of the Emporia dam: no hunting.'),
  // Shown with their text but no weapon change: conditions rather than bans.
  inArea('cumberland-county--rifle-area', 'county:Cumberland', [], 'Sec. 46-111', 'Deer rifles .23 caliber or larger only from a stand at least 10 ft high here.'),
  inArea('greene-county--locust-lane-midway-acres', 'county:Greene', [], 'Sec. 54-1', 'No firearm discharge here except on private land with the owner’s permission.'),
);

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
