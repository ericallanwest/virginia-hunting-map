import type { Summary } from './regs/engine';
import { speciesInfo, type ViewId } from './regs/index';
import type { Species } from './regs/types';

export type View = ViewId;

export interface Category {
  key: string;
  label: string;
  color: string;
}

const CLOSED: Category = { key: 'closed', label: 'Closed', color: 'var(--c-closed)' };
const CHECK: Category = { key: 'check', label: 'Lottery/quota or check posted rules', color: 'var(--c-check)' };

const TAKE_CATS: Record<string, Category> = {
  'either-sex': { key: 'either-sex', label: 'Either sex', color: 'var(--c-either)' },
  antlered: { key: 'antlered', label: 'Antlered (bucks) only', color: 'var(--c-antlered)' },
  antlerless: { key: 'antlerless', label: 'Antlerless (does) only', color: 'var(--c-antlerless)' },
  bearded: { key: 'bearded', label: 'Bearded birds only (spring)', color: 'var(--c-antlered)' },
};

export function legendFor(species: Species, view: View): Category[] {
  if (view === 'weapon') {
    return [
      { key: 'firearms', label: 'Firearms', color: 'var(--c-firearms)' },
      { key: 'muzzleloader', label: 'Muzzleloader (+ archery)', color: 'var(--c-muzzleloader)' },
      { key: 'archery', label: 'Archery only', color: 'var(--c-archery)' },
      CHECK,
      CLOSED,
    ];
  }
  if (view === 'dogs') {
    return [
      { key: 'yes', label: 'Open — hounds allowed', color: 'var(--c-either)' },
      // 'varies' (hounds allowed in only part of an area) needs an unmapped split; all are mapped now.
      { key: 'no', label: 'Open — no hounds', color: 'var(--c-muzzleloader)' },
      CHECK,
      CLOSED,
    ];
  }
  const takes = speciesInfo(species).takes ?? [];
  return [...takes.map((t) => TAKE_CATS[t]).filter(Boolean), CHECK, CLOSED];
}

export function categoryOf(s: Summary, species: Species, view: View): Category {
  const legend = legendFor(species, view);
  if (s.status === 'closed') return CLOSED;
  if (s.status === 'check') return CHECK;
  const key = view === 'weapon' ? s.weapon : view === 'dogs' ? s.dogs : s.take === 'mixed' ? 'either-sex' : s.take;
  return legend.find((c) => c.key === key) ?? CHECK;
}

/** Resolve a CSS custom property to a concrete color (SVG fill attributes can't use var()). */
export function cssColor(c: string): string {
  const m = /^var\((--[\w-]+)\)$/.exec(c);
  return m ? getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() : c;
}
