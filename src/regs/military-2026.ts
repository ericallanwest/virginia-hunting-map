/**
 * Military installations' own hunting seasons, 2026-27 license year.
 *
 * On a base listed here, a species with seasons below shows these instead of the state
 * framework (engine.ts militarySeasons). A species not listed, and every license year
 * without an entry, falls back to the state seasons marked "check the installation".
 * Dates are 'MM-DD' in the license year. Base-wide closed days (weekdays, holidays) are on
 * every rule via `weekdays` / `extraDays` / `closedDays`.
 *
 * Sources (all downloaded and read 2026-11-11):
 * - Quantico: MCINCR-MCBQ Bulletin 5-26, "2026-2027 Fiscal Year Hunting and Trapping Seasons
 *   and Fishing Regulations Update" (signed 11 Sep 2026), para. 3.a.(2)(d) and Enclosure (1).
 *   https://quantico.isportsman.net/files/Bulletins/MCINCR-MCBQBul%205-26_2026-2027%20FISCAL%20YEAR%20HUNTING%20AND%20TRAPPING%20SEASONS%20AND%20FISHING%20REGULATIONS%20UPDATE.pdf
 * - Fort A.P. Hill: FAPH Regulation 200-10 (July 2026), "2026-2027 iSportsman Programs
 *   Regulations", sec. 2-3 and Appendix A; fall turkey and bear dates (which Appendix A says
 *   follow the state's) from the base's "2026-2027 Fort A.P. Hill Big Game Cheat Sheet".
 *   https://walker.isportsman.net/files/Regulations%2F2026-27%20iSportsman%20Programs%20Final.pdf
 *   https://walker.isportsman.net/files/Hunting/BigGameCheatSheet2026.pdf
 * - Fort Pickett: ARNG JTC Fort Pickett Regulation 210-11 (2026-2027), para. 1.c and Appendix A.
 *   https://barfoot.isportsman.net/files/Regulations/2627FtPickettRegulationsFinal.pdf
 * - Fort Belvoir: Fort Belvoir Wildlife Resources Hunting & Fishing Management regulations
 *   2026-2027 (WRHFM), sec. 4.1-4.5.
 *   https://ftbelvoir.isportsman.net/files/WRHFM_20262027.pdf
 * - Fort Eustis: JBLE Instruction 32-102 (12 Sep 2025), sec. 2.2 ("General hunting seasons
 *   follow Virginia DWR regulations"), and the 2026-2027 notice on https://jble.isportsman.net/.
 *   No base-specific season dates, so no seasons are encoded; only the note.
 */
import { WEST_OF_I95_CITIES, WEST_OF_I95_COUNTIES } from './i95.generated';
import type { DateRange, SeasonRule, Species, Where } from './types';

export interface BaseYear {
  /** Installation name, as a key of HUNTING_PROGRAMS. */
  installation: string;
  licenseYear: number;
  /** The base's regulation, as cited to the user. */
  source: string;
  url: string;
  /** Bag limits and key rules for the year. */
  note: string;
  /** The base's own seasons. Species without any fall back to the state framework. */
  seasons: SeasonRule[];
  /** Species the base closes for the year. */
  closed?: Species[];
}

type Days = Pick<SeasonRule, 'weekdays' | 'extraDays' | 'closedDays'>;
type Spec = Omit<SeasonRule, 'id' | 'where' | 'take'> & Partial<Pick<SeasonRule, 'where' | 'take'>>;

/** Rules for one base: ids, base-wide days, and `where: {}` (the whole base) unless given. */
function rules(prefix: string, days: Days, specs: Spec[]): SeasonRule[] {
  const n: Partial<Record<Species, number>> = {};
  return specs.map((s) => {
    n[s.species] = (n[s.species] ?? 0) + 1;
    return { take: 'any', where: {}, ...days, ...s, id: `${prefix}-${s.species}-${n[s.species]}` };
  });
}

const W95: Where = { counties: WEST_OF_I95_COUNTIES, cities: WEST_OF_I95_CITIES };
const E95: Where = { statewide: true, not: [W95] };
const d = (mmdd: string): DateRange => [mmdd, mmdd];

// --- Marine Corps Base Quantico -------------------------------------------------
const QUANTICO = 'Marine Corps Base Quantico';
const Q_SOURCE = 'MCBQ Bulletin 5-26 (2026-2027 hunting and trapping seasons)';
/**
 * Bul 5-26 para. 3.a.(2)(d): "Hunting on Sundays is authorized. There will be no hunting on
 * Tuesdays and Wednesdays ... Hunting is authorized each year on 11 November (i.e., Veteran's
 * Day) even if it falls on a Tuesday or Wednesday. The GCS is closed on the following holidays
 * with no hunting or scouting on Labor Day, Thanksgiving Day, Christmas Eve, Christmas Day, and
 * New Year's Day."
 */
const Q_DAYS: Days = {
  weekdays: [0, 1, 4, 5, 6],
  extraDays: [d('11-11')],
  closedDays: [d('09-07'), d('11-26'), ['12-24', '12-25'], d('01-01')],
};
const Q_WATERFOWL_YOUTH = 'Youth 15 and under, military veterans, and active-duty service members.';
const Q_NOT_LISTED = 'Not listed in Bul 5-26: species not listed follow DWR seasons on MCBQ hunt days, and no fall season runs past Jan 31.';

const quantico: BaseYear = {
  installation: QUANTICO,
  licenseYear: 2026,
  source: Q_SOURCE,
  url: 'https://quantico.isportsman.net/files/Bulletins/MCINCR-MCBQBul%205-26_2026-2027%20FISCAL%20YEAR%20HUNTING%20AND%20TRAPPING%20SEASONS%20AND%20FISHING%20REGULATIONS%20UPDATE.pdf',
  note:
    'MCBQ Bulletin 5-26: Sunday hunting allowed; no hunting Tuesdays or Wednesdays except Nov 11 (Veterans Day); no hunting on Labor Day, ' +
    'Thanksgiving, Christmas Eve, Christmas Day or New Year’s Day. No fall season past Jan 31 except the Feb 6 youth & veterans waterfowl day. ' +
    'Deer: 1 per day, 3 per license year at MCBQ (no more than 1 antlerless and 2 antlered); DWR bonus tags not valid; DMAP tags (antlerless, listed archery areas, 1 per day) ' +
    'don’t count against limits. No muzzleloader season (except wheelchair-mobility and Wounded Warrior hunts) and no extended deer seasons. ' +
    'Turkey: 1 per day, 3 per year, only 1 beardless (fall). Bear: 1 per season, at least 100 lb live / 75 lb dressed, no females with cubs. ' +
    'Rabbit and squirrel 6 per day (fox squirrel closed in Stafford County); quail and grouse closed. Raccoon and bobcat 2, gray fox 1 per hunting party per day; ' +
    'no night hunting. Coyote and skunk during any open MCBQ season with that season’s weapon. Other species follow DWR seasons on MCBQ hunt days.',
  seasons: rules('mcbq', Q_DAYS, [
    // Deer
    { species: 'deer', type: 'youth', label: 'Youth/apprentice (firearms or archery)', dates: [['09-26', '09-27']], take: 'either-sex', youthOnly: true },
    { species: 'deer', type: 'archery', label: 'Archery', dates: [['10-03', '11-13']], take: 'either-sex', notes: ['Either-sex, base-wide.'] },
    {
      species: 'deer',
      type: 'firearms',
      label: 'Firearms (buck-only except Dec 5 & Jan 2)',
      dates: [['11-14', '01-02']],
      take: 'by-days',
      eitherSexDays: [d('12-05'), d('01-02')],
      noRifles: true,
      notes: [
        'Shotgun, muzzleloader or archery tackle; buck-only except the designated either-sex days (Dec 5, Jan 2).',
        'Either-sex all season within archery-only areas (archery tackle only).',
      ],
    },
    // Turkey
    { species: 'turkey', type: 'youth', label: 'Youth/apprentice fall turkey', dates: [['10-10', '10-11']], take: 'either-sex', youthOnly: true },
    { species: 'turkey', type: 'archery', label: 'Fall archery', dates: [['10-03', '11-13']], take: 'either-sex' },
    { species: 'turkey', type: 'firearms', label: 'Fall firearms', dates: [['10-17', '10-30'], ['11-30', '12-26'], ['01-09', '01-23']], take: 'either-sex' },
    { species: 'turkey', type: 'youth', label: 'Youth/apprentice spring gobbler (until noon)', dates: [['04-03', '04-04']], take: 'bearded', youthOnly: true, hours: 'until-noon' },
    { species: 'turkey', type: 'firearms', label: 'Spring gobbler (until noon all season)', dates: [['04-10', '05-15']], take: 'bearded', hours: 'until-noon' },
    // Bear (MCBQ follows Fauquier County's dates; no early firearms, youth weekend or muzzleloader season)
    { species: 'bear', type: 'archery', label: 'Archery', dates: [['10-17', '11-13']] },
    { species: 'bear', type: 'firearms', label: 'Firearms', dates: [['11-27', '11-29'], ['12-21', '01-02']], notes: ['Archery tackle only in archery-only areas.'] },
    // Small game
    { species: 'rabbit', type: 'firearms', label: 'Rabbit', dates: [['10-31', '01-31']] },
    { species: 'squirrel', type: 'firearms', label: 'Squirrel', dates: [['09-10', '01-31']], notes: ['Fox squirrel season is closed in Stafford County.'] },
    // Furbearers (hunting); no night hunting
    { species: 'opossum', type: 'firearms', label: 'Opossum', dates: [['10-15', '01-31']], hours: 'half-hour' },
    { species: 'raccoon', type: 'firearms', label: 'Raccoon', dates: [['10-15', '01-31']], hours: 'half-hour' },
    { species: 'bobcat', type: 'archery', label: 'Bobcat archery', dates: [['10-03', '10-31']], hours: 'half-hour' },
    { species: 'bobcat', type: 'firearms', label: 'Bobcat firearms', dates: [['11-01', '01-31']], hours: 'half-hour' },
    { species: 'fox', type: 'firearms', label: 'Red fox', dates: [['11-01', '01-31']], hours: 'half-hour' },
    { species: 'fox', type: 'firearms', label: 'Gray fox', dates: [['01-02', '01-31']], hours: 'half-hour' },
    // Migratory game birds
    { species: 'dove', type: 'firearms', label: 'Dove', dates: [['09-10', '10-24'], ['11-21', '11-29'], ['12-19', '01-18']], hours: 'until-sunset' },
    { species: 'duck', type: 'firearms', label: 'September teal (east of I-95)', dates: [['09-19', '09-27']], where: E95 },
    { species: 'duck', type: 'firearms', label: 'September teal (west of I-95)', dates: [['09-24', '09-27']], where: W95 },
    { species: 'duck', type: 'firearms', label: 'Ducks & mergansers (black duck closed)', dates: [['10-09', '10-12']] },
    { species: 'duck', type: 'firearms', label: 'Ducks & mergansers', dates: [['11-19', '11-29'], ['12-19', '01-31']] },
    { species: 'duck', type: 'youth', label: 'Youth & veterans waterfowl days', dates: [d('10-24'), d('02-06')], youthOnly: true, notes: [Q_WATERFOWL_YOUTH] },
    { species: 'goose', type: 'firearms', label: 'September Canada goose (east of I-95)', dates: [['09-10', '09-18']], where: E95, hours: 'half-hour' },
    { species: 'goose', type: 'firearms', label: 'September Canada goose (east of I-95)', dates: [['09-19', '09-25']], where: E95, hours: 'until-sunset' },
    { species: 'goose', type: 'firearms', label: 'September Canada goose (west of I-95)', dates: [['09-10', '09-21']], where: W95, hours: 'half-hour' },
    { species: 'goose', type: 'firearms', label: 'September Canada goose (west of I-95)', dates: [['09-24', '09-25']], where: W95, hours: 'until-sunset' },
    { species: 'goose', type: 'firearms', label: 'Canada goose', dates: [['11-27', '11-29'], ['12-26', '01-31']], notes: ['2 per day.'] },
    { species: 'goose', type: 'firearms', label: 'Light geese (DWR season, to Jan 31)', dates: [['11-25', '01-31']], notes: [Q_NOT_LISTED] },
    { species: 'goose', type: 'firearms', label: 'Atlantic brant (DWR season)', dates: [['12-19', '12-31'], ['01-15', '01-31']], notes: [Q_NOT_LISTED] },
    { species: 'goose', type: 'youth', label: 'Youth & veterans waterfowl days', dates: [d('10-24'), d('02-06')], youthOnly: true, notes: [Q_WATERFOWL_YOUTH] },
    { species: 'woodcock', type: 'firearms', label: 'Woodcock', dates: [['11-11', '11-30'], ['12-26', '01-18']] },
    { species: 'woodcock', type: 'firearms', label: 'Snipe (DWR season)', dates: [['09-28', '11-29'], ['12-19', '01-31']], notes: [Q_NOT_LISTED] },
  ]),
  closed: ['quail', 'grouse'],
};

// --- Fort A.P. Hill -------------------------------------------------------------
/** FAPH Reg 200-10 sec. 2.A "No Sunday Hunting"; sec. 3.B check-out times: Christmas Eve and Christmas Day "(Closed)". */
const APH_DAYS: Days = { weekdays: [1, 2, 3, 4, 5, 6], closedDays: [['12-24', '12-25']] };
const APH_ARCHERY_ES = 'Either-sex all season (Oct 3 – Jan 2) with archery tackle.';

const apHill: BaseYear = {
  installation: 'Fort A.P. Hill (formerly Fort Walker)',
  licenseYear: 2026,
  source: 'FAPH Regulation 200-10 (July 2026), Appendix A',
  url: 'https://walker.isportsman.net/files/Regulations%2F2026-27%20iSportsman%20Programs%20Final.pdf',
  note:
    'FAPH Reg 200-10: no Sunday hunting; closed Christmas Eve and Christmas Day (check out by noon on Thanksgiving). No centerfire rifles, handguns or buckshot. ' +
    'Deer: 1 per day (2 on youth day and Oct 3–30, only 1 antlered), 6 per year (up to 6 antlerless, 2 antlered); antler point restrictions in Training Areas (TA) and ' +
    'Controlled Access Areas (CA); either-sex all season with archery tackle; firearms either-sex days shown are the TAs’ — CAs add Nov 28 and Dec 2, 5, 9. ' +
    'Bonus tags accepted. No deer dogs. Turkey: 1 per day, 2 per year; spring hunting ends at noon. Bear: 1 per year, at least 100 lb live / 75 lb dressed, no females with cubs. ' +
    'Quail 3 per day, 12 per season; bobcat 1 per season; no dogs for raccoon, bobcat or fox. Rabbit, squirrel, dove, woodcock and waterfowl follow state seasons ' +
    '(still no Sunday hunting). Groundhog, coyote and feral hog during any open season.',
  seasons: rules('faph', APH_DAYS, [
    // Deer
    { species: 'deer', type: 'youth', label: 'Youth & apprentice deer day', dates: [d('09-26')], take: 'either-sex', youthOnly: true, noRifles: true, notes: ['2 deer, only 1 antlered.'] },
    { species: 'deer', type: 'archery', label: 'Early archery', dates: [['10-03', '11-13']], take: 'either-sex' },
    {
      species: 'deer',
      type: 'muzzleloader',
      label: 'Muzzleloader',
      dates: [['10-31', '11-13']],
      take: 'by-days',
      eitherSexDays: [d('10-31'), d('11-04'), ['11-06', '11-07'], d('11-11'), d('11-13')],
      notes: [APH_ARCHERY_ES],
    },
    {
      species: 'deer',
      type: 'firearms',
      label: 'Firearms',
      dates: [['11-14', '01-02']],
      take: 'by-days',
      eitherSexDays: [d('11-14'), d('11-18'), d('11-21'), d('11-25'), d('12-30'), d('01-02')],
      noRifles: true,
      notes: ['Training Area either-sex days. Controlled Access Areas also Nov 28, Dec 2, Dec 5, Dec 9.', APH_ARCHERY_ES],
    },
    // Bear (Appendix A: follows the state's seasons; dates as on the base's cheat sheet)
    { species: 'bear', type: 'youth', label: 'Youth & Apprentice Bear Hunting Weekend (state)', dates: [['10-10', '10-11']], youthOnly: true, noRifles: true },
    { species: 'bear', type: 'archery', label: 'Archery', dates: [['10-03', '11-13']] },
    { species: 'bear', type: 'muzzleloader', label: 'Muzzleloader', dates: [['11-07', '11-13']] },
    { species: 'bear', type: 'firearms', label: 'Firearms', dates: [['11-23', '01-02']], noRifles: true },
    // Turkey
    { species: 'turkey', type: 'archery', label: 'Fall archery', dates: [['10-03', '11-13']], take: 'either-sex' },
    { species: 'turkey', type: 'youth', label: 'Youth & Apprentice Fall Turkey Weekend (state)', dates: [['10-10', '10-11']], take: 'either-sex', youthOnly: true },
    {
      species: 'turkey',
      type: 'firearms',
      label: 'Fall firearms',
      dates: [['10-17', '10-30'], ['11-25', '11-26'], ['11-30', '12-26'], ['01-09', '01-23']],
      take: 'either-sex',
      noRifles: true,
    },
    { species: 'turkey', type: 'youth', label: 'Youth & apprentice spring turkey day (until noon)', dates: [d('04-03')], take: 'bearded', youthOnly: true, hours: 'until-noon' },
    { species: 'turkey', type: 'firearms', label: 'Spring turkey (until noon all season)', dates: [['04-10', '05-15']], take: 'bearded', hours: 'until-noon', noRifles: true },
    // Crow (Appendix A, exceptions to state regulations)
    { species: 'crow', type: 'firearms', label: 'Crow (Mon, Wed, Fri, Sat)', dates: [['09-05', '02-27']], weekdays: [1, 3, 5, 6] },
  ]),
};

// --- Fort Pickett ---------------------------------------------------------------
/** Reg 210-11 para. 1.c: "Hunting is permitted on Fort Pickett Tuesday-Saturday during open hunting seasons." */
const PK_DAYS: Days = { weekdays: [2, 3, 4, 5, 6] };
const PK_NOT_LISTED = 'Not listed in Reg 210-11, which says ducks and geese follow Virginia seasons — confirm with the Fort Pickett game check station.';

const pickett: BaseYear = {
  installation: 'Fort Pickett (formerly Fort Barfoot)',
  licenseYear: 2026,
  source: 'Fort Pickett Regulation 210-11 (2026-2027), Appendix A',
  url: 'https://barfoot.isportsman.net/files/Regulations/2627FtPickettRegulationsFinal.pdf',
  note:
    'Fort Pickett Reg 210-11: hunting Tuesday–Saturday only; “all state recognized holidays will be observed” (check iSportsman for holiday closures). ' +
    'No centerfire rifles or handguns; deer only with archery tackle, shotgun slugs/buckshot, or .45+ caliber muzzleloaders. No deer dogs; apprentice licenses are not honored. ' +
    'Deer: 2 per day; 3 antlered bucks per hunter; bucks in Controlled Access Areas (CAA) need 6+ points, and the CAA is either-sex all firearms season; ' +
    'archery-only areas allow antlerless deer any time during the firearms season. Bonus tags accepted. Turkey: 1 per day, 3 per year, only 1 beardless; spring until noon all season. ' +
    'Bear: 1 per year, at least 100 lb live / 75 lb dressed; base quota of 4 bears, after which the season closes. ' +
    'Quail 6 per day, woodcock 3 per day (both Tue/Thu/Sat); crow Wed/Fri/Sat; rabbit and squirrel 6 per day; grouse closed; ' +
    'raccoon 2 per hunter, bobcat 2 per party per day; no dogs for fox, bobcat or raccoon. Dove: 15 per day; in September the managed dove fields are Wed/Sat only. ' +
    'Groundhog, coyote and feral hog any time while checked in to hunt an open season. Snipe is not listed (shown closed) — ask the game check station.',
  seasons: rules('pickett', PK_DAYS, [
    // Deer
    { species: 'deer', type: 'youth', label: 'Youth deer day', dates: [d('09-26')], take: 'either-sex', youthOnly: true, noRifles: true },
    { species: 'deer', type: 'archery', label: 'Early archery', dates: [['10-03', '11-13']], take: 'either-sex' },
    { species: 'deer', type: 'muzzleloader', label: 'Muzzleloader', dates: [['10-31', '11-13']], take: 'either-sex' },
    {
      species: 'deer',
      type: 'firearms',
      label: 'Firearms',
      dates: [['11-14', '01-02']],
      take: 'by-days',
      eitherSexDays: [d('11-21'), d('11-28'), ['12-05', '01-02']],
      noRifles: true,
      notes: ['General hunting areas. Either-sex all season in the Controlled Access Area.'],
    },
    // Turkey
    { species: 'turkey', type: 'archery', label: 'Fall archery', dates: [['10-03', '11-13']], take: 'either-sex' },
    { species: 'turkey', type: 'youth', label: 'Youth fall turkey day', dates: [d('10-10')], take: 'either-sex', youthOnly: true },
    {
      species: 'turkey',
      type: 'firearms',
      label: 'Fall firearms',
      dates: [['10-17', '10-30'], d('11-25'), ['11-30', '12-12'], ['01-09', '01-23']],
      take: 'either-sex',
      noRifles: true,
    },
    { species: 'turkey', type: 'youth', label: 'Youth spring turkey day (until noon)', dates: [d('04-03')], take: 'bearded', youthOnly: true, hours: 'until-noon' },
    { species: 'turkey', type: 'firearms', label: 'Spring turkey (until noon all season)', dates: [['04-10', '05-15']], take: 'bearded', hours: 'until-noon', noRifles: true },
    // Bear (no archery bear season on Fort Pickett)
    { species: 'bear', type: 'muzzleloader', label: 'Muzzleloader', dates: [['11-07', '11-13']] },
    { species: 'bear', type: 'firearms', label: 'Firearms', dates: [['11-30', '01-02']], noRifles: true },
    // Small game
    { species: 'quail', type: 'firearms', label: 'Quail (Tue, Thu, Sat)', dates: [['11-07', '01-31']], weekdays: [2, 4, 6] },
    { species: 'rabbit', type: 'firearms', label: 'Rabbit', dates: [['10-31', '02-28']] },
    { species: 'squirrel', type: 'firearms', label: 'Squirrel', dates: [['09-05', '02-28']] },
    { species: 'crow', type: 'firearms', label: 'Crow (Wed, Fri, Sat)', dates: [['09-05', '02-28']], weekdays: [3, 5, 6] },
    // Furbearers
    { species: 'fox', type: 'firearms', label: 'Red fox', dates: [['11-01', '02-28']] },
    { species: 'fox', type: 'firearms', label: 'Gray fox', dates: [['01-01', '02-28']] },
    { species: 'bobcat', type: 'archery', label: 'Bobcat archery', dates: [['10-03', '10-31']] },
    { species: 'bobcat', type: 'firearms', label: 'Bobcat firearms', dates: [['11-01', '02-28']] },
    { species: 'raccoon', type: 'firearms', label: 'Raccoon', dates: [['10-15', '02-28']] },
    // Migratory game birds
    { species: 'dove', type: 'firearms', label: 'Dove — opening day (noon to sunset)', dates: [d('09-05')], hours: 'noon-sunset' },
    { species: 'dove', type: 'firearms', label: 'Dove', dates: [['09-06', '10-24'], ['11-21', '11-29'], ['12-19', '01-18']] },
    { species: 'woodcock', type: 'firearms', label: 'Woodcock (Tue, Thu, Sat)', dates: [['11-11', '12-01'], ['12-26', '01-18']], weekdays: [2, 4, 6] },
    { species: 'duck', type: 'firearms', label: 'September teal', dates: [['09-22', '09-27']] },
    { species: 'duck', type: 'firearms', label: 'Ducks (black duck closed)', dates: [['10-09', '10-12']], notes: ['Fort Pickett is open only Oct 9 and 10 in this segment.'] },
    { species: 'duck', type: 'firearms', label: 'Ducks', dates: [['11-18', '11-29'], ['12-19', '01-31']] },
    { species: 'duck', type: 'youth', label: 'Youth & veterans waterfowl days', dates: [d('10-24'), d('02-06')], youthOnly: true },
    { species: 'goose', type: 'firearms', label: 'September Canada goose', dates: [['09-05', '09-21']], hours: 'half-hour', notes: ['10 per day.'] },
    { species: 'goose', type: 'firearms', label: 'September Canada goose', dates: [['09-22', '09-25']], notes: ['10 per day.'] },
    { species: 'goose', type: 'firearms', label: 'Canada goose (Resident Population Zone)', dates: [['11-18', '11-29'], ['12-19', '02-21']], notes: ['5 per day.'] },
    { species: 'goose', type: 'firearms', label: 'Light geese (state season)', dates: [['11-25', '03-10']], notes: [PK_NOT_LISTED] },
    { species: 'goose', type: 'youth', label: 'Youth & veterans waterfowl days', dates: [d('10-24'), d('02-06')], youthOnly: true },
  ]),
  closed: ['grouse'],
};

// --- Fort Belvoir ---------------------------------------------------------------
const belvoir: BaseYear = {
  installation: 'Fort Belvoir',
  licenseYear: 2026,
  source: 'Fort Belvoir WRHFM 2026-2027 hunting regulations',
  url: 'https://ftbelvoir.isportsman.net/files/WRHFM_20262027.pdf',
  note:
    'Fort Belvoir WRHFM 2026-2027: archery tackle is the only legal means for deer, turkey and small game — no firearms. ' +
    'Deer: no daily limit with proper tags; Earn a Buck (Fairfax County); QDM areas require 4 points on a side or a 15½-inch spread (not for hunters under 16 or apprentices); ' +
    'housing areas are bowhunting Mon–Fri until 3 pm only, closed when Fairfax County Public Schools close, elevated stands only. ' +
    'Every deer head (except fawns) goes to CWD testing. Turkey: state tags and limits; spring turkey by lottery and reservation. ' +
    'Other wildlife follows DWR seasons with archery tackle; waterfowl follows DWR/USFWS seasons from reserved blinds.',
  seasons: rules('belvoir', {}, [
    { species: 'deer', type: 'archery', label: 'Youth/apprentice (archery)', dates: [['09-26', '09-27']], take: 'either-sex', youthOnly: true },
    { species: 'deer', type: 'archery', label: 'Early antlerless (archery)', dates: [['09-05', '10-02']], take: 'antlerless' },
    { species: 'deer', type: 'archery', label: 'Either-sex (archery)', dates: [['10-03', '01-02']], take: 'either-sex' },
    { species: 'deer', type: 'archery', label: 'Late antlerless (archery)', dates: [['01-03', '03-28']], take: 'antlerless' },
    {
      species: 'turkey',
      type: 'archery',
      label: 'Fall turkey (archery)',
      dates: [['10-03', '11-13'], ['11-25', '11-26'], ['11-30', '12-26'], ['01-09', '01-23']],
      take: 'either-sex',
    },
    { species: 'turkey', type: 'archery', label: 'Youth/apprentice spring turkey (archery)', dates: [['04-03', '04-04']], take: 'bearded', youthOnly: true },
    {
      species: 'turkey',
      type: 'archery',
      label: 'Spring turkey (archery)',
      dates: [['04-10', '05-15']],
      take: 'bearded',
      notes: ['Hours follow DWR: until noon through Apr 25, until sunset Apr 26 – May 15.'],
    },
  ]),
};

// --- Joint Base Langley-Eustis - Fort Eustis ------------------------------------
const eustis: BaseYear = {
  installation: 'Joint Base Langley-Eustis - Fort Eustis',
  licenseYear: 2026,
  source: 'JBLE Instruction 32-102 and the 2026-2027 notice on jble.isportsman.net',
  url: 'https://jble.isportsman.net/',
  note:
    'JBLE-Eustis: seasons follow DWR; hunting days are set by the base and posted on iSportsman. 2026–27: only 2 antlered deer per hunter; antlered deer south of Island Creek ' +
    'and in Hunting Area 1 need at least 4 points on one side (not for youth/apprentice hunters); antlerless deer unlimited with state tags. ' +
    'Archery only in the Cantonment; no deer dogs; every deer must be checked at the base check station before leaving.',
  seasons: [],
};

export const MILITARY_2026: BaseYear[] = [quantico, apHill, pickett, belvoir, eustis];
