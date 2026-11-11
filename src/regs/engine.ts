import { inRanges, licenseYearOf, resolve } from './dates';
import type { DateRange, InfoRule, Land, Place, SeasonRule, SeasonType, Selector, SpeciesRegs, Take, Where } from './types';
import { CITY_PARENT } from './virginia';

// ---------------------------------------------------------------------------
// Selector matching
// ---------------------------------------------------------------------------

/** 'Rockingham/east' matches name 'Rockingham' only when subArea is 'east'; 'Rockingham' matches any side. */
function nameMatches(entry: string, name: string | undefined, subArea: string | undefined): boolean {
  if (!name) return false;
  const [base, side] = entry.split('/');
  return base === name && (side === undefined || side === subArea);
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

export type Weapon = 'firearms' | 'muzzleloader' | 'archery';
export const WEAPON_OF: Record<SeasonType, Weapon> = {
  youth: 'firearms',
  archery: 'archery',
  urban_archery: 'archery',
  muzzleloader: 'muzzleloader',
  firearms: 'firearms',
  antlerless_firearms: 'firearms',
};

export type DayTake = Take | 'quota' | 'check';

export interface OpenSeason {
  rule: SeasonRule;
  take: DayTake;
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
    if (!hasFirearms && policy) {
      if (policy.status === 'private-rules') {
        const asPrivate: Place = { ...place, land: 'private', property: undefined };
        for (const rule of regs.seasons) {
          if (!firearmsTypes.includes(rule.type) || !matches(rule.where, asPrivate)) continue;
          if (out.some((s) => s.rule.id === rule.id)) continue;
          out.push({ ...toPlaceSeason(regs, rule, asPrivate), note: policy.note });
        }
      } else {
        // 'check': every season here is subject to the property's posted rules.
        const scope = place.land === 'state_park' ? 'all' : 'firearms';
        for (const s of out) {
          if (scope === 'all' || firearmsTypes.includes(s.rule.type)) {
            s.take = 'check';
            s.note = policy.note;
          }
        }
        if (scope === 'firearms') {
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
      open.push({ rule: s.rule, take: dayTake(s, iso, ly), note: s.note });
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

const WEAPON_RANK: Weapon[] = ['archery', 'muzzleloader', 'firearms'];

export function summarize(open: OpenSeason[]): Summary {
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
  return { status: 'open', weapon, take };
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
