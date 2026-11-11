import { deer2026 } from './deer-2026';
import { licenseYearOf } from './dates';
import type { Species, SpeciesRegs } from './types';

/** All encoded regulation sets. Add a new entry per species per license year. */
const ALL: SpeciesRegs[] = [deer2026];

export const SPECIES: { id: Species; label: string; available: boolean }[] = [
  { id: 'deer', label: 'Deer', available: true },
  { id: 'bear', label: 'Bear', available: false },
  { id: 'turkey', label: 'Turkey', available: false },
  { id: 'elk', label: 'Elk', available: false },
];

export function regsFor(species: Species, iso: string): SpeciesRegs | undefined {
  const ly = licenseYearOf(iso);
  return ALL.find((r) => r.species === species && r.licenseYear === ly);
}

export function availableYears(species: Species): number[] {
  return ALL.filter((r) => r.species === species).map((r) => r.licenseYear);
}
