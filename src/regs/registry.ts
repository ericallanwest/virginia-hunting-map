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
import { bear2025 } from './bear-2025';
import { deer2025 } from './deer-2025';
import { elk2025 } from './elk-2025';
import { FURBEARERS_2025 } from './furbearer-2025';
import { SMALL_GAME_2025 } from './small-game-2025';
import { turkey2025 } from './turkey-2025';
import { bear2024 } from './bear-2024';
import { deer2024 } from './deer-2024';
import { elk2024 } from './elk-2024';
import { FURBEARERS_2024 } from './furbearer-2024';
import { SMALL_GAME_2024 } from './small-game-2024';
import { turkey2024 } from './turkey-2024';
import type { Species, SpeciesRegs } from './types';

export const ALL_REGS: SpeciesRegs[] = [
  // 2026–27
  deer2026, bear2026, turkey2026, elk2026, ...SMALL_GAME, ...FURBEARERS,
  // 2025–26 (archived)
  deer2025, bear2025, turkey2025, elk2025, ...SMALL_GAME_2025, ...FURBEARERS_2025,
  // 2024–25 (archived)
  deer2024, bear2024, turkey2024, elk2024, ...SMALL_GAME_2024, ...FURBEARERS_2024,
];

export function regsFor(species: Species, iso: string): SpeciesRegs | undefined {
  const ly = licenseYearOf(iso);
  return ALL_REGS.find((r) => r.species === species && r.licenseYear === ly);
}
