/**
 * Virginia elk regulations, 2025-26 license year.
 * Source: 2025–2026 Virginia Hunting & Trapping Regulations digest, p. 33 (PDF page; printed p. 31),
 *   https://www.eregulations.com/assets/docs/guides/25VAHD_LR.pdf
 *   sha256 19e03a913e95ac37bef013418087802de23e8726d6c321c82d6c2390b65c7075
 * cross-checked with sources/regs/2025-26/eregulations/elk-hunting.html.
 */
import { deer2025 } from './deer-2025';
import { deriveElk } from './elk';

export const elk2025 = deriveElk(deer2025, {
  // "Virginia’s fourth elk hunt within the Elk Management Zone ... will occur October 11–17, 2025."
  lottery: ['10-11', '10-17'],
  lotteryLabel: 'Oct 11–17, 2025',
  lotteryNotes: [
    'Only holders of an elk license awarded through the elk hunt lottery may hunt elk in Buchanan, Dickenson, and Wise counties.',
    'Lottery applications open each February–March ($15 residents, $20 nonresidents).',
  ],
  source: 'https://www.eregulations.com/assets/docs/guides/25VAHD_LR.pdf',
});
