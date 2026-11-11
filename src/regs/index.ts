import { ALL_REGS, regsFor } from './registry';
import type { Species, Take } from './types';

export { regsFor };
const ALL = ALL_REGS;

export type ViewId = 'weapon' | 'take' | 'dogs';

export type Group = 'big' | 'small' | 'fur';

export const GROUPS: { id: Group; label: string }[] = [
  { id: 'big', label: 'Big Game' },
  { id: 'small', label: 'Small Game' },
  { id: 'fur', label: 'Furbearer' },
];

export interface SpeciesInfo {
  id: Species;
  group: Group;
  label: string;
  available: boolean;
  /** Map views offered for this species (first is the default). */
  views: { id: ViewId; label: string }[];
  /** Take categories shown in the 'take' view legend. */
  takes?: Take[];
}

const WEAPON = { id: 'weapon' as const, label: 'Open weapon' };

export const SPECIES: SpeciesInfo[] = [
  {
    id: 'deer',
    group: 'big',
    label: 'Deer',
    available: true,
    views: [{ id: 'weapon', label: 'Open weapon' }, { id: 'take', label: 'Antlered / antlerless' }],
    takes: ['either-sex', 'antlered', 'antlerless'],
  },
  {
    id: 'bear',
    group: 'big',
    label: 'Bear',
    available: true,
    views: [{ id: 'weapon', label: 'Open weapon' }, { id: 'dogs', label: 'Hounds' }],
  },
  {
    id: 'turkey',
    group: 'big',
    label: 'Turkey',
    available: true,
    views: [{ id: 'weapon', label: 'Open weapon' }, { id: 'take', label: 'Either sex / bearded' }],
    takes: ['either-sex', 'bearded'],
  },
  { id: 'elk', group: 'big', label: 'Elk', available: true, views: [WEAPON] },
  // Small game
  { id: 'squirrel', group: 'small', label: 'Squirrel', available: true, views: [WEAPON] },
  { id: 'rabbit', group: 'small', label: 'Rabbit', available: true, views: [WEAPON] },
  { id: 'grouse', group: 'small', label: 'Grouse', available: true, views: [WEAPON] },
  { id: 'quail', group: 'small', label: 'Quail', available: true, views: [WEAPON] },
  { id: 'pheasant', group: 'small', label: 'Pheasant', available: true, views: [WEAPON] },
  { id: 'crow', group: 'small', label: 'Crow', available: true, views: [WEAPON] },
  { id: 'groundhog', group: 'small', label: 'Groundhog', available: true, views: [WEAPON] },
  // Furbearers (fisher and spotted skunk have no open season)
  { id: 'bobcat', group: 'fur', label: 'Bobcat', available: true, views: [WEAPON, { id: 'dogs', label: 'Dogs' }] },
  { id: 'coyote', group: 'fur', label: 'Coyote', available: true, views: [WEAPON] },
  { id: 'fox', group: 'fur', label: 'Fox', available: true, views: [WEAPON, { id: 'dogs', label: 'Dogs' }] },
  { id: 'raccoon', group: 'fur', label: 'Raccoon', available: true, views: [WEAPON] },
  { id: 'opossum', group: 'fur', label: 'Opossum', available: true, views: [WEAPON] },
  { id: 'skunk', group: 'fur', label: 'Skunk', available: true, views: [WEAPON] },
];

export const speciesInfo = (s: Species) => SPECIES.find((x) => x.id === s)!;


/** License years with encoded regulations, oldest first. */
export const loadedYears = (): number[] => [...new Set(ALL.map((r) => r.licenseYear))].sort();

export const yearLabel = (y: number) => `${y}–${String((y + 1) % 100).padStart(2, '0')}`;

export function availableYears(species: Species): number[] {
  return ALL.filter((r) => r.species === species).map((r) => r.licenseYear);
}
