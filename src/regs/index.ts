import { bear2026 } from './bear-2026';
import { licenseYearOf } from './dates';
import { deer2026 } from './deer-2026';
import { elk2026 } from './elk-2026';
import { turkey2026 } from './turkey-2026';
import type { Species, SpeciesRegs, Take } from './types';

/** All encoded regulation sets. Add a new entry per species per license year. */
const ALL: SpeciesRegs[] = [deer2026, bear2026, turkey2026, elk2026];

export type ViewId = 'weapon' | 'take' | 'dogs';

export interface SpeciesInfo {
  id: Species;
  label: string;
  available: boolean;
  /** Map views offered for this species (first is the default). */
  views: { id: ViewId; label: string }[];
  /** Take categories shown in the 'take' view legend. */
  takes?: Take[];
}

export const SPECIES: SpeciesInfo[] = [
  {
    id: 'deer',
    label: 'Deer',
    available: true,
    views: [{ id: 'weapon', label: 'Open weapon' }, { id: 'take', label: 'Antlered / antlerless' }],
    takes: ['either-sex', 'antlered', 'antlerless'],
  },
  {
    id: 'bear',
    label: 'Bear',
    available: true,
    views: [{ id: 'weapon', label: 'Open weapon' }, { id: 'dogs', label: 'Hounds' }],
  },
  {
    id: 'turkey',
    label: 'Turkey',
    available: true,
    views: [{ id: 'weapon', label: 'Open weapon' }, { id: 'take', label: 'Either sex / bearded' }],
    takes: ['either-sex', 'bearded'],
  },
  { id: 'elk', label: 'Elk', available: true, views: [{ id: 'weapon', label: 'Open weapon' }] },
];

export const speciesInfo = (s: Species) => SPECIES.find((x) => x.id === s)!;

export function regsFor(species: Species, iso: string): SpeciesRegs | undefined {
  const ly = licenseYearOf(iso);
  return ALL.find((r) => r.species === species && r.licenseYear === ly);
}

export function availableYears(species: Species): number[] {
  return ALL.filter((r) => r.species === species).map((r) => r.licenseYear);
}
