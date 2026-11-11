/**
 * Every encoded regulation set, all species and license years. Add new years here.
 * Kept separate from index.ts (UI species metadata) so the engine can look up other
 * species' rules for the same date (e.g. bobcat/fox dog rules follow deer seasons).
 */
import { bear2026 } from './bear-2026';
import { licenseYearOf } from './dates';
import { deer2026 } from './deer-2026';
import { elk2026 } from './elk-2026';
import { FURBEARERS } from './furbearer-2026';
import { SMALL_GAME } from './small-game-2026';
import { turkey2026 } from './turkey-2026';
import type { Species, SpeciesRegs } from './types';

export const ALL_REGS: SpeciesRegs[] = [deer2026, bear2026, turkey2026, elk2026, ...SMALL_GAME, ...FURBEARERS];

export function regsFor(species: Species, iso: string): SpeciesRegs | undefined {
  const ly = licenseYearOf(iso);
  return ALL_REGS.find((r) => r.species === species && r.licenseYear === ly);
}
