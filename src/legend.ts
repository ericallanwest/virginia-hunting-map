import type { Summary } from './regs/engine';

export type View = 'weapon' | 'antlerless';

export interface Category {
  key: string;
  label: string;
  color: string;
}

const CLOSED: Category = { key: 'closed', label: 'Closed', color: 'var(--c-closed)' };
const CHECK: Category = { key: 'check', label: 'Quota hunt / check posted rules', color: 'var(--c-check)' };

export const LEGENDS: Record<View, Category[]> = {
  weapon: [
    { key: 'firearms', label: 'Firearms', color: 'var(--c-firearms)' },
    { key: 'muzzleloader', label: 'Muzzleloader (+ archery)', color: 'var(--c-muzzleloader)' },
    { key: 'archery', label: 'Archery only', color: 'var(--c-archery)' },
    CHECK,
    CLOSED,
  ],
  antlerless: [
    { key: 'either-sex', label: 'Either sex', color: 'var(--c-either)' },
    { key: 'antlered', label: 'Antlered (bucks) only', color: 'var(--c-antlered)' },
    { key: 'antlerless', label: 'Antlerless (does) only', color: 'var(--c-antlerless)' },
    CHECK,
    CLOSED,
  ],
};

export function categoryOf(s: Summary, view: View): Category {
  const legend = LEGENDS[view];
  if (s.status === 'closed') return CLOSED;
  if (s.status === 'check') return CHECK;
  const key = view === 'weapon' ? s.weapon : s.take === 'mixed' ? 'either-sex' : s.take;
  return legend.find((c) => c.key === key) ?? CHECK;
}

/** Resolve a CSS custom property to a concrete color (SVG fill attributes can't use var()). */
export function cssColor(c: string): string {
  const m = /^var\((--[\w-]+)\)$/.exec(c);
  return m ? getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() : c;
}
