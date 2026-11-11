/**
 * Virginia migratory game birds, 2026-27 license year.
 *
 * Sources (all checked 2026-11-11):
 * - DWR, Migratory Game Birds: https://dwr.virginia.gov/hunting/regulations/migratory-gamebirds/
 *   (snapshot in sources/regs/migratory-gamebirds.html). Every date, zone, limit and hour below
 *   comes from this page.
 * - DWR, 2026–2027 Virginia Hunting, Trapping, and Migratory Game Bird Seasons Guide, pp. 31–32
 *   (https://dwr.virginia.gov/wp-content/uploads/media/2026-2027-Virginia-Hunting-Trapping-and-Migratory-Game-Bird-Seasons-Guide.pdf).
 *   Same dates and limits. It went to print before the Light Goose Conservation Order was
 *   decided ("will be determined in September 2026"); the web page says it is not offered.
 * - U.S. Department of the Interior, Migratory Game Bird Hunting Memorandum MGBHM–2026–02
 *   (Aug 27, 2026), "2026–2027 seasons in certain States", Virginia entries: the federal
 *   authorization for the same dates, limits, and hours (from 2026–27 the federal seasons are
 *   set by memorandum instead of an annual Federal Register frameworks rule).
 *
 * Virginia has no Southern James Bay Canada goose zone (only the AP and RP zones) and no
 * longer has a special sea duck season or zone: the old zone is now the "Special Sea Duck
 * Area", where crippled waterfowl may be pursued under power (an info fact, not a season).
 *
 * Crow stays in Small Game: it is federally protected but is not a "migratory game bird" in
 * DWR's definition (General Regulations, Definitions) or in the federal seasons memorandum,
 * DWR lists it on the small game page, and its rules (no HIP, Mon/Wed/Fri/Sat, unplugged
 * shotguns, electronic calls) are unlike those for migratory game birds.
 */
import { WEST_OF_I95_CITIES, WEST_OF_I95_COUNTIES } from './i95.generated';
import { regs } from './small-game-2026';
import type { DateRange, InfoRule, SeasonRule, SpeciesRegs, Where } from './types';

export const MIGRATORY_SOURCE = 'https://dwr.virginia.gov/hunting/regulations/migratory-gamebirds/';

type Season = Omit<SeasonRule, 'species' | 'id'>;
const season = (label: string, dates: DateRange[], where: Where | Where[], extra: Partial<Season> = {}): Season => ({
  type: 'firearms',
  label,
  dates,
  where,
  take: 'any',
  ...extra,
});
const fact = (topic: InfoRule['topic'], text: string, where: InfoRule['where'] = { statewide: true }, dates?: DateRange[]) => ({
  topic,
  text,
  where,
  dates,
});

// --- Areas -------------------------------------------------------------------
const STATEWIDE: Where = { statewide: true };
/** West / east of I-95 (I-95 jurisdictions are split along it in the map data). */
const W95: Where = { counties: WEST_OF_I95_COUNTIES, cities: WEST_OF_I95_CITIES };
const E95: Where = { statewide: true, not: [W95] };

/**
 * Canada goose zones. DWR's boundary (quoted in GOOSE_ZONE_AP below) runs along the Blue Ridge
 * county lines, then I-64, I-95, Route 460 and Route 32. Each jurisdiction (or I-95 side) was
 * classified against that line using Census TIGER/Line 2023 roads and the app's boundaries.
 * Localities the line crosses are listed in GOOSE_SPLIT_* and get both zones' seasons with a
 * note saying which part each applies to.
 */
const AP_COUNTIES = [
  'Accomack', 'Arlington', 'Caroline', 'Charles City', 'Chesterfield/e95', 'Culpeper', 'Essex', 'Fairfax', 'Fauquier',
  'Gloucester', 'Greene', 'Hanover', 'Henrico/e95', 'James City', 'King George', 'King William', 'King and Queen',
  'Lancaster', 'Loudoun', 'Madison', 'Mathews', 'Middlesex', 'New Kent', 'Northampton', 'Northumberland', 'Orange',
  'Prince William', 'Rappahannock', 'Richmond', 'Spotsylvania', 'Stafford', 'Surry', 'Westmoreland', 'York',
];
const AP_CITIES = [
  'Alexandria', 'Charlottesville', 'Chesapeake', 'Colonial Heights/e95', 'Fairfax', 'Falls Church', 'Fredericksburg',
  'Hampton', 'Hopewell', 'Manassas', 'Manassas Park', 'Newport News', 'Norfolk', 'Poquoson', 'Portsmouth',
  'Richmond/e95', 'Suffolk/east', 'Virginia Beach', 'Williamsburg',
];
/** Crossed by I-64: north of it is AP, south is RP. */
const GOOSE_SPLIT_I64: Where = { counties: ['Albemarle', 'Goochland', 'Henrico/w95', 'Louisa'] };
/** Crossed by Route 460 (Petersburg to Suffolk): north/east of it is AP. */
const GOOSE_SPLIT_460: Where = { counties: ['Isle of Wight', 'Prince George/e95', 'Southampton', 'Sussex/e95'], cities: ['Petersburg/e95'] };
/** Western Suffolk, crossed by Route 460 and Route 32. */
const GOOSE_SPLIT_SUFFOLK: Where = { cities: ['Suffolk/west'] };
const GOOSE_SPLIT = [GOOSE_SPLIT_I64, GOOSE_SPLIT_460, GOOSE_SPLIT_SUFFOLK];
export const GOOSE_AP: Where = { counties: AP_COUNTIES, cities: AP_CITIES };
export const GOOSE_RP: Where = { statewide: true, not: [GOOSE_AP, ...GOOSE_SPLIT] };

const GOOSE_ZONE_AP =
  'Atlantic Population (AP) Hunt Zone: “The area east of the “Blue Ridge” (Loudoun County-Clarke County border) at the West Virginia-Virginia border, south to Interstate 64 (the Blue Ridge line follows county borders along the western edge of Loudoun-Fauquier- Rappahannock-Madison-Greene-Albemarle and into Nelson counties), then east along Interstate Rt. 64 to Interstate 95 in Richmond, then south along I-95 to Route 460 in Petersburg, then southeast along Route 460 to Route 32 in the City of Suffolk, then south to the North Carolina border.”';
const GOOSE_ZONE_RP = 'Resident Population (RP) Hunt Zone: “The portion of the state west of the above AP Zone boundary.”';

/** Tundra swan: "all counties and portions of counties lying east of I-95 and south of the
 * Prince William/Stafford County line in Chopawamsic Creek". Read as including the independent
 * cities in that area (the federal memorandum and DWR describe an area, not a county list). */
export const SWAN_AREA: Where = { statewide: true, not: [W95, { counties: ['Prince William', 'Fairfax'], cities: ['Alexandria'] }] };
const SWAN_AREA_TEXT =
  'Tundra Swan Hunt Area: “Hunting will be permitted in all counties and portions of counties lying east of I-95 and south of the Prince William/Stafford County line in Chopawamsic Creek at Quantico Marine Corps Base.”';

// --- Shared facts ------------------------------------------------------------
const HOURS = fact('hours', 'Migratory game birds: one half-hour before sunrise until sunset — not until a half-hour after sunset as for other game.');
const SUNDAY = fact('hours', 'Sunday hunting is allowed, except within 200 yards of a house of worship or its accessory structures.');
const HIP = fact(
  'license',
  'Virginia hunting license (unless license-exempt) and HIP registration — required of every migratory bird hunter, licensed or license-exempt, and renewed each July 1 (GoOutdoorsVirginia.com or 844-802-4193).',
);
const STAMPS = fact(
  'license',
  'Waterfowl hunters 16 and older also need a Federal Migratory Bird Hunting and Conservation Stamp (federal duck stamp; an electronic E-Stamp is sold through GoOutdoorsVirginia.com) and a Virginia Migratory Waterfowl Conservation Stamp (unless license-exempt).',
);
const NONTOXIC = fact(
  'methods',
  'Non-toxic shot only (steel, bismuth-tin, tungsten-based and other approved types; no larger than “T”). Lead shot may not be possessed in the field while hunting waterfowl, mergansers, coots, gallinules, moorhens, rails or snipe.',
);
const SHOTGUN = fact(
  'methods',
  'Shotguns no larger than 10 gauge, plugged to hold no more than three shells. Rifles, pistols, baiting, live decoys, recorded or electronic calls, and shooting from a moving motorboat or sailboat are unlawful.',
);
const COMMON: ReturnType<typeof fact>[] = [
  HIP,
  HOURS,
  SUNDAY,
  fact('access', 'National Park Service land — hunting is prohibited.', { land: ['nps'] }),
  fact('access', 'Hunting in state parks is limited to designated parks, areas, and dates — check DCR before hunting.', { land: ['state_park'] }),
  fact('access', 'National Wildlife Refuges open to hunting may have stricter rules — check the refuge’s regulations.'),
  fact('local', 'Cities and towns set their own weapon restrictions — check local ordinances.', [{ anyCity: true }, { anyTown: true }]),
];
const YOUTH_DAYS: DateRange[] = [['10-24', '10-24'], ['02-06', '02-06']];
const YOUTH_NOTE =
  'Youth 15 and under, military veterans, and active-duty Armed Forces members (including National Guard and Reserves on active duty other than for training). Youth must be accompanied by a licensed adult 18 or older, who may not hunt ducks unless a veteran.';

// --- Dove --------------------------------------------------------------------
const NO_DOVE_WMAS = { properties: ['Hog Island WMA', 'Princess Anne WMA'] };
export const dove2026 = regs(
  'dove',
  MIGRATORY_SOURCE,
  [
    season('Dove — opening day (noon to sunset)', [['09-05', '09-05']], { statewide: true, not: [NO_DOVE_WMAS] }, { hours: 'noon-sunset' }),
    season('Dove', [['09-06', '10-24'], ['11-21', '11-29'], ['12-19', '01-18']], { statewide: true, not: [NO_DOVE_WMAS] }),
  ],
  [
    fact('bag', '15 per day, 45 in possession — mourning doves and white-winged doves, singly or in combination.'),
    fact('hours', 'Opening day (Sep 5): 12 noon until sunset.', STATEWIDE, [['09-05', '09-05']]),
    fact('access', 'Dove hunting is permitted on all WMAs except Hog Island and Princess Anne. Some waterfowl WMAs exclude dove hunting within impoundments — see the WMA’s page.', { land: ['dwr'] }),
    fact('methods', 'Shotguns no larger than 10 gauge, plugged to hold no more than three shells. Baiting is unlawful. Blaze orange or pink is not required of dove hunters.'),
    ...COMMON,
  ],
);

// --- Ducks, teal, mergansers, coots -------------------------------------------
export const duck2026 = regs(
  'duck',
  MIGRATORY_SOURCE,
  [
    season('September teal (east of I-95)', [['09-19', '09-27']], E95, { notes: ['Blue-winged and green-winged teal only.'] }),
    season('September teal (west of I-95)', [['09-22', '09-27']], W95, { notes: ['Blue-winged and green-winged teal only.'] }),
    season('Ducks, mergansers & coots (black duck closed)', [['10-09', '10-12']], STATEWIDE, { notes: ['Black duck season is closed Oct 9–12.'] }),
    season('Ducks, mergansers & coots', [['11-18', '11-29'], ['12-19', '01-31']], STATEWIDE),
    season('Youth & veterans waterfowl day', YOUTH_DAYS, STATEWIDE, { type: 'youth', youthOnly: true, notes: [YOUTH_NOTE] }),
  ],
  [
    fact(
      'bag',
      'Ducks: 6 per day of any species, including no more than 4 mallards (only 2 hens), 3 wood ducks, 2 black ducks (none Oct 9–12), 2 redheads, 2 canvasbacks, 3 pintails, 1 mottled duck, 1 fulvous whistling duck, and 4 sea ducks (no more than 3 scoters, 3 eiders [only 1 hen], 3 long-tailed ducks). Harlequin ducks: closed.',
    ),
    fact('bag', 'Scaup: 1 per day.', STATEWIDE, [['10-09', '10-12'], ['11-18', '11-29'], ['12-19', '01-11']]),
    fact('bag', 'Scaup: 2 per day (Jan 12–31).', STATEWIDE, [['01-12', '01-31']]),
    fact('bag', 'September teal: 6 per day, 18 in possession (blue-winged and green-winged teal only).', STATEWIDE, [['09-19', '09-27']]),
    fact('bag', 'Mergansers: 5 per day (hooded, red-breasted and common in any combination), 15 in possession. Coots: 15 per day, 45 in possession.'),
    fact('bag', 'Possession limit: three times the daily bag. Youth & veterans days: the regular daily bag.'),
    STAMPS,
    NONTOXIC,
    SHOTGUN,
    fact(
      'methods',
      'Crippled waterfowl may be pursued under power only in the Special Sea Duck Area: “The ocean waters of Virginia, the tidal waters of Northampton and Accomack counties up to the first highway bridge, and the Chesapeake Bay and each of its tributaries up to the first highway bridge. Back Bay and its tributaries are not included.” There is no separate sea duck season.',
    ),
    fact('access', 'Waterfowl hunting is permitted on all WMAs, though some have special restrictions or quota hunts — see the WMA’s page.', { land: ['dwr'] }),
    ...COMMON,
  ],
);

// --- Geese, brant, tundra swan -------------------------------------------------
const AP_DATES: DateRange[] = [['11-24', '11-29'], ['12-24', '01-31']];
const RP_DATES: DateRange[] = [['11-18', '11-29'], ['12-19', '02-21']];
const AP_PART = {
  i64: 'Only the part north of I-64 (Atlantic Population Zone).',
  r460: 'Only the part north and east of Route 460 (Atlantic Population Zone).',
  suffolk: 'Only the part north of Route 460 and east of Route 32 (Atlantic Population Zone).',
};
const RP_PART = {
  i64: 'Only the part south of I-64 (Resident Population Zone).',
  r460: 'Only the part south and west of Route 460 (Resident Population Zone).',
  suffolk: 'Only the part south of Route 460 and west of Route 32 (Resident Population Zone).',
};
const zoned = (label: string, dates: DateRange[], zone: 'AP' | 'RP'): Season[] => {
  const part = zone === 'AP' ? AP_PART : RP_PART;
  return [
    season(label, dates, zone === 'AP' ? GOOSE_AP : GOOSE_RP),
    season(label, dates, GOOSE_SPLIT_I64, { partialNote: part.i64 }),
    season(label, dates, GOOSE_SPLIT_460, { partialNote: part.r460 }),
    season(label, dates, GOOSE_SPLIT_SUFFOLK, { partialNote: part.suffolk }),
  ];
};
const SEPT_GOOSE_WHERE = (side: Where): Where => ({ ...side, not: [...(side.not ?? []), { properties: ['Amelia WMA', 'Dick Cross WMA'] }] });
const UNPLUGGED = 'Shotguns holding more than three shells may be used.';
const PLUGGED = 'Teal season is open: plugged shotguns (three shells) only.';

export const goose2026 = regs(
  'goose',
  MIGRATORY_SOURCE,
  [
    season('September Canada goose', [['09-01', '09-18']], SEPT_GOOSE_WHERE(E95), { hours: 'half-hour', notes: [UNPLUGGED] }),
    season('September Canada goose', [['09-19', '09-25']], SEPT_GOOSE_WHERE(E95), { notes: [PLUGGED] }),
    season('September Canada goose', [['09-01', '09-21']], SEPT_GOOSE_WHERE(W95), { hours: 'half-hour', notes: [UNPLUGGED] }),
    season('September Canada goose', [['09-22', '09-25']], SEPT_GOOSE_WHERE(W95), { notes: [PLUGGED] }),
    ...zoned('Canada & white-fronted geese — AP Zone', AP_DATES, 'AP'),
    ...zoned('Canada & white-fronted geese — RP Zone', RP_DATES, 'RP'),
    season('Light geese (snow & Ross’s)', [['11-25', '03-10']], STATEWIDE),
    season('Atlantic brant', [['12-19', '12-31'], ['01-15', '01-31']], STATEWIDE),
    season('Tundra swan (permit holders only)', [['11-15', '01-31']], SWAN_AREA, { take: 'quota' }),
    season('Youth & veterans waterfowl day', YOUTH_DAYS, STATEWIDE, { type: 'youth', youthOnly: true, notes: [YOUTH_NOTE] }),
  ],
  [
    fact('zone', GOOSE_ZONE_AP),
    fact('zone', GOOSE_ZONE_RP),
    fact('zone', 'This county is crossed by I-64: north of I-64 is the AP Zone, south is the RP Zone.', GOOSE_SPLIT_I64),
    fact('zone', 'This area is crossed by Route 460: north and east of Route 460 is the AP Zone, south and west is the RP Zone.', GOOSE_SPLIT_460),
    fact('zone', 'Western Suffolk is crossed by the zone line (Route 460, then Route 32 south to North Carolina): north of Route 460 and east of Route 32 is the AP Zone; the rest is the RP Zone.', GOOSE_SPLIT_SUFFOLK),
    // The line touches these RP localities only at their edges; say so rather than split them.
    fact('zone', 'RP Zone, except any part of the county north of I-64 (the AP Zone line runs “into Nelson” to I-64 at Rockfish Gap).', { counties: ['Nelson'] }),
    fact('zone', 'RP Zone, except any land north of I-64 (AP Zone) where the county touches I-64.', { counties: ['Fluvanna'] }),
    fact('zone', 'RP Zone, except any land north of I-64 (AP Zone) near the I-64/I-95 interchange.', { cities: ['Richmond/w95'] }),
    fact('zone', SWAN_AREA_TEXT, SWAN_AREA),
    fact('zone', `Outside the tundra swan hunt area. ${SWAN_AREA_TEXT}`, { statewide: true, not: [SWAN_AREA] }),
    fact('bag', 'Canada geese (including white-fronted geese): AP Zone 2 per day, 6 in possession.', [GOOSE_AP, ...GOOSE_SPLIT]),
    fact('bag', 'Canada geese (including white-fronted geese): RP Zone 5 per day, 15 in possession.', [GOOSE_RP, ...GOOSE_SPLIT]),
    fact('bag', 'September Canada goose: 10 per day, 30 in possession.', STATEWIDE, [['09-01', '09-25']]),
    fact('bag', 'Light geese (greater and lesser snow geese and Ross’s geese): 25 per day, no possession limit.'),
    fact('bag', 'Atlantic brant: 1 per day, 3 in possession.'),
    fact('bag', 'Tundra swan: 1 per permittee per season.', SWAN_AREA),
    fact(
      'bag',
      'Youth & veterans days (Oct 24, Feb 6): Canada geese 2 per day in the AP Zone (one listing on DWR’s page says 1 — confirm with DWR) and 5 in the RP Zone; regular daily bags of other waterfowl, and 1 tundra swan with a swan permit.',
      STATEWIDE,
      YOUTH_DAYS,
    ),
    fact(
      'license',
      'Tundra swan permit: issued by drawing (online applications closed Sep 25, 2026; at most 475 permits). Cancel the permit at the kill and attach it to the swan; return the hunt survey by Feb 15, 2027.',
      SWAN_AREA,
    ),
    STAMPS,
    fact(
      'license',
      'September Canada goose: HIP registration, a federal duck stamp, and a Virginia Migratory Waterfowl Conservation Stamp (unless license-exempt) are required.',
      STATEWIDE,
      [['09-01', '09-25']],
    ),
    fact('hours', 'September Canada goose: until one half-hour after sunset Sep 1–18 east of I-95 and Sep 1–21 west of I-95; until sunset after that.', STATEWIDE, [['09-01', '09-25']]),
    NONTOXIC,
    SHOTGUN,
    fact(
      'methods',
      'Light geese: electronic calls and unplugged shotguns are permitted in areas and at times when all other waterfowl seasons are closed. The Light Goose Conservation Order is not offered in 2026–27.',
      STATEWIDE,
      [['11-25', '03-10']],
    ),
    fact('access', 'September Canada goose hunting is not permitted on Amelia and Dick Cross WMAs.', { properties: ['Amelia WMA', 'Dick Cross WMA'] }, [['09-01', '09-25']]),
    fact('access', 'Waterfowl hunting is permitted on all WMAs, though some have special restrictions or quota hunts — see the WMA’s page.', { land: ['dwr'] }),
    ...COMMON,
  ],
);

// --- Woodcock & snipe -----------------------------------------------------------
export const woodcock2026 = regs(
  'woodcock',
  MIGRATORY_SOURCE,
  [
    season('Woodcock', [['11-11', '12-01'], ['12-26', '01-18']], STATEWIDE),
    season('Snipe', [['09-28', '11-29'], ['12-19', '01-31']], STATEWIDE, { notes: ['Non-toxic shot required for snipe.'] }),
  ],
  [
    fact('bag', 'Woodcock: 3 per day, 9 in possession. Snipe: 8 per day, 24 in possession.'),
    fact('methods', 'Snipe: non-toxic shot only; lead shot may not be possessed in the field while hunting snipe. DWR’s non-toxic shot rule does not list woodcock.'),
    fact('methods', 'Shotguns no larger than 10 gauge, plugged to hold no more than three shells.'),
    ...COMMON,
  ],
);

// --- Rails, gallinules & moorhens --------------------------------------------------
export const rail2026 = regs(
  'rail',
  MIGRATORY_SOURCE,
  [season('Rails & gallinules', [['09-05', '10-24'], ['11-10', '11-29']], STATEWIDE, { notes: ['Clapper, king, sora and Virginia rails; common (moorhen) and purple gallinules.'] })],
  [
    fact('bag', 'Clapper & king rails: 10 per day combined, only 1 a king rail; 30 in possession, only 3 king rails.'),
    fact('bag', 'Sora & Virginia rails: 25 per day combined, 75 in possession.'),
    fact('bag', 'Gallinules (common and purple, counted together): 15 per day, 45 in possession.'),
    NONTOXIC,
    fact('methods', 'Shotguns no larger than 10 gauge, plugged to hold no more than three shells. Shooting from a motorboat is lawful only once the motor is shut off and the boat has stopped.'),
    ...COMMON,
  ],
);

export const MIGRATORY: SpeciesRegs[] = [dove2026, duck2026, goose2026, woodcock2026, rail2026];
