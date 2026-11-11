import { inRanges, licenseYearOf, resolve } from './dates';
import type { DateRange, InfoRule, Land, Place, SeasonRule, SeasonType, Selector, SpeciesRegs, Take, Where } from './types';
import { CITY_PARENT, splitFor } from './virginia';

// ---------------------------------------------------------------------------
// Selector matching
// ---------------------------------------------------------------------------

/** 'Rockingham/east' matches name 'Rockingham' only when subArea is 'east'; 'Rockingham' matches any side. */
function nameMatches(entry: string, name: string | undefined, subArea: string | undefined): boolean {
  if (!name) return false;
  const [base, side] = entry.split('/');
  if (base !== name) return false;
  if (side === undefined) return true;
  // Sides are '+'-joined tokens ('s81+w16'); every token in the entry must be on the place's side.
  const have = (subArea ?? '').split('+');
  return side.split('+').every((t) => have.includes(t));
}

const anyName = (list: string[] | undefined, name: string | undefined, sub: string | undefined) =>
  !!list?.some((e) => nameMatches(e, name, sub));

export function matchesWhere(w: Where, p: Place): boolean {
  const geoGiven =
    w.statewide || w.counties || w.countiesInclCities || w.cities || w.towns || w.anyCity || w.anyTown;
  if (geoGiven) {
    // A county name matches places in the county but not independent cities inside it.
    const county = p.city ? undefined : p.county;
    const parent = p.city ? CITY_PARENT[p.city] ?? undefined : p.county;
    const geo =
      !!w.statewide ||
      anyName(w.counties, county, p.subArea) ||
      anyName(w.countiesInclCities, parent, p.city ? undefined : p.subArea) ||
      anyName(w.cities, p.city, p.subArea) ||
      anyName(w.towns, p.town, undefined) ||
      (!!w.anyCity && !!p.city) ||
      (!!w.anyTown && !!p.town);
    if (!geo) return false;
  }
  if (w.region && w.region !== p.region) return false;
  if (w.land && !w.land.includes(p.land)) return false;
  if (w.properties && !(p.property && w.properties.includes(p.property))) return false;
  if (w.not?.some((x) => matchesWhere(x, p))) return false;
  return true;
}

export const matches = (sel: Selector, p: Place) =>
  Array.isArray(sel) ? sel.some((w) => matchesWhere(w, p)) : matchesWhere(sel, p);

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

export type Weapon = 'firearms' | 'muzzleloader' | 'archery' | 'none';
export const WEAPON_OF: Record<SeasonType, Weapon> = {
  chase: 'none',
  youth: 'firearms',
  archery: 'archery',
  urban_archery: 'archery',
  muzzleloader: 'muzzleloader',
  firearms: 'firearms',
  antlerless_firearms: 'firearms',
};

export type DayTake = Take | 'quota' | 'check';

/** Whether dogs may be used: 'varies' = only in part of this jurisdiction. */
export type DogStatus = 'yes' | 'no' | 'varies';

export interface OpenSeason {
  rule: SeasonRule;
  take: DayTake;
  dogs?: DogStatus;
  dogsNote?: string;
  /** Extra explanation for this place (e.g. why a fallback applied). */
  note?: string;
}

/** A season rule as it applies to a place over the whole license year (for timelines). */
export interface PlaceSeason {
  rule: SeasonRule;
  dates: DateRange[];
  /** Either-sex days when take is 'by-days' (empty = antlered only). */
  eitherSexDays: DateRange[] | 'full';
  take: SeasonRule['take'] | 'check';
  note?: string;
}

export interface Summary {
  status: 'open' | 'closed' | 'check';
  weapon?: Weapon;
  take?: DayTake | 'mixed';
  dogs?: DogStatus;
}

export interface Evaluation {
  open: OpenSeason[];
  info: InfoRule[];
  summary: Summary;
}

/** Season rules that apply to the place at all (any date), with public-land fallbacks resolved. */
export function seasonsForPlace(regs: SpeciesRegs, place: Place): PlaceSeason[] {
  const out: PlaceSeason[] = [];
  if (place.land !== 'private' && regs.unlistedPublicPolicy[place.land]?.status === 'closed') return out;
  const firearmsTypes: SeasonType[] = ['firearms', 'antlerless_firearms'];

  for (const rule of regs.seasons) {
    if (!matches(rule.where, place)) continue;
    out.push(toPlaceSeason(regs, rule, place));
  }

  if (place.land !== 'private') {
    const hasFirearms = out.some((s) => s.rule.type === 'firearms');
    const policy = regs.unlistedPublicPolicy[place.land];
    if ((!hasFirearms || policy?.always) && policy) {
      if (policy.status === 'private-rules') {
        const asPrivate: Place = { ...place, land: 'private', property: undefined };
        for (const rule of regs.seasons) {
          if (!firearmsTypes.includes(rule.type) || !matches(rule.where, asPrivate)) continue;
          if (out.some((s) => s.rule.id === rule.id)) continue;
          out.push({ ...toPlaceSeason(regs, rule, asPrivate), note: policy.note });
        }
      } else {
        // 'check': every season here is subject to the property's posted rules.
        const scope = place.land === 'state_park' || policy.always ? 'all' : 'firearms';
        for (const s of out) {
          if (scope === 'all' || firearmsTypes.includes(s.rule.type)) {
            s.take = 'check';
            s.note = policy.note;
          }
        }
        if (scope === 'firearms' && !hasFirearms) {
          out.push({
            rule: {
              id: `${regs.species}-firearms-check`,
              species: regs.species,
              type: 'firearms',
              label: 'Firearms (property rules)',
              dates: [['11-14', '01-02']],
              where: {},
              take: 'by-days',
            },
            dates: [['11-14', '01-02']],
            eitherSexDays: [],
            take: 'check',
            note: policy.note,
          });
        }
      }
    }
  }
  return out;
}

function toPlaceSeason(regs: SpeciesRegs, rule: SeasonRule, place: Place): PlaceSeason {
  let eitherSexDays: DateRange[] | 'full' = [];
  if (rule.take === 'by-days') {
    if (rule.eitherSexDays) eitherSexDays = rule.eitherSexDays;
    if (rule.esGroup) {
      const extra: DateRange[] = [];
      for (const es of regs.eitherSex) {
        if (es.esGroup !== rule.esGroup || !matches(es.where, place)) continue;
        if (es.dates === 'full') {
          eitherSexDays = 'full';
          break;
        }
        extra.push(...es.dates);
      }
      if (eitherSexDays !== 'full') eitherSexDays = [...eitherSexDays, ...extra];
    }
  }
  const take = rule.take === 'by-days' && eitherSexDays === 'full' ? 'either-sex' : rule.take;
  return { rule, dates: rule.dates, eitherSexDays, take };
}

/** Evaluate what is legal for `species` at `place` on ISO date `iso`. */
export function evaluate(regs: SpeciesRegs, place: Place, iso: string, opts: { includeYouth?: boolean } = {}): Evaluation {
  const ly = regs.licenseYear;
  const open: OpenSeason[] = [];
  if (licenseYearOf(iso) === ly) {
    for (const s of seasonsForPlace(regs, place)) {
      if (!inRanges(iso, s.dates, ly)) continue;
      const o: OpenSeason = { rule: s.rule, take: dayTake(s, iso, ly), note: s.note };
      if (s.rule.dogs && o.take !== 'check') Object.assign(o, dogStatus(regs, s.rule, place, iso));
      open.push(o);
    }
  }
  const info = regs.info.filter((i) => matches(i.where, place) && (!i.dates || inRanges(iso, i.dates, ly)));
  const closedLand = place.land !== 'private' && regs.unlistedPublicPolicy[place.land]?.status === 'closed';
  if (closedLand) return { open, info: info.filter((i) => i.topic === 'access'), summary: { status: 'closed' } };
  const counted = open.filter((o) => opts.includeYouth || !o.rule.youthOnly);
  return { open, info, summary: summarize(counted) };
}

export function dayTake(s: PlaceSeason, iso: string, ly: number): DayTake {
  if (s.take !== 'by-days') return s.take;
  if (s.eitherSexDays === 'full') return 'either-sex';
  return inRanges(iso, s.eitherSexDays, ly) ? 'either-sex' : 'antlered';
}

const WEAPON_RANK: Weapon[] = ['none', 'archery', 'muzzleloader', 'firearms'];

/** Dog use for an open season at a place/date, after Sundays and the species' DogRules. */
export function dogStatus(regs: SpeciesRegs, rule: SeasonRule, place: Place, iso: string): { dogs: DogStatus; dogsNote?: string } {
  if (regs.noDogsOnSunday && new Date(`${iso}T12:00:00Z`).getUTCDay() === 0) return { dogs: 'no', dogsNote: 'No dogs on Sundays.' };
  let varies: string | undefined;
  for (const r of regs.dogRules ?? []) {
    if (r.seasonTypes && !r.seasonTypes.includes(rule.type)) continue;
    if (r.dates && !inRanges(iso, r.dates, regs.licenseYear)) continue;
    const m = matchDegree(r.where, place);
    if (m === 'none') continue;
    if (m === 'full' && !r.partial) return { dogs: 'no', dogsNote: r.note };
    varies ??= r.partial ?? 'Prohibited on one side of the dividing line — choose your side in the panel.';
  }
  return varies ? { dogs: 'varies', dogsNote: `No dogs ${varies}` } : { dogs: 'yes' };
}

/**
 * Like `matches`, but for a place in a jurisdiction split by a line we haven't
 * mapped (and whose side is unknown) reports 'partial' when only some sides match.
 */
export function matchDegree(sel: Selector, place: Place): 'full' | 'partial' | 'none' {
  const jid = place.city ? `city:${place.city}` : place.county ? `county:${place.county}` : '';
  const split = splitFor(jid);
  if (!split || split.mapped || place.subArea) return matches(sel, place) ? 'full' : 'none';
  const hits = Object.keys(split.parts).filter((sub) => matches(sel, { ...place, subArea: sub })).length;
  return hits === 0 ? 'none' : hits === Object.keys(split.parts).length ? 'full' : 'partial';
}

export function summarize(all: OpenSeason[]): Summary {
  const open = all.filter((o) => o.rule.type !== 'chase');
  const definite = open.filter((o) => o.take !== 'check' && o.take !== 'quota');
  if (definite.length === 0) {
    return open.length ? { status: 'check', take: open[0].take } : { status: 'closed' };
  }
  const weapon = definite
    .map((o) => WEAPON_OF[o.rule.type])
    .reduce((a, b) => (WEAPON_RANK.indexOf(b) > WEAPON_RANK.indexOf(a) ? b : a));
  const takes = new Set(definite.map((o) => o.take));
  const take: Summary['take'] = takes.has('either-sex')
    ? 'either-sex'
    : takes.size > 1
      ? 'mixed'
      : [...takes][0];
  // Dogs are only summarized for species whose seasons model them (bear, turkey).
  const modelsDogs = definite.some((o) => o.dogs) || definite.some((o) => o.rule.species === 'bear');
  const dogSet = new Set(definite.map((o) => o.dogs ?? 'no'));
  const dogs: DogStatus | undefined = !modelsDogs ? undefined : dogSet.has('yes') ? 'yes' : dogSet.has('varies') ? 'varies' : 'no';
  return dogs ? { status: 'open', weapon, take, dogs } : { status: 'open', weapon, take };
}

/** All dates (ISO) in the license year on which the place's status changes; useful for "next change" hints. */
export function nextChange(regs: SpeciesRegs, place: Place, iso: string): string | undefined {
  const ly = regs.licenseYear;
  const edges = new Set<string>();
  for (const s of seasonsForPlace(regs, place)) {
    for (const [a, b] of s.dates) {
      edges.add(resolve(a, ly));
      edges.add(nextDay(resolve(b, ly)));
    }
    if (Array.isArray(s.eitherSexDays))
      for (const [a, b] of s.eitherSexDays) {
        edges.add(resolve(a, ly));
        edges.add(nextDay(resolve(b, ly)));
      }
  }
  return [...edges].filter((e) => e > iso).sort()[0];
}

export function nextDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + 1));
  return t.toISOString().slice(0, 10);
}

export type { Land };
