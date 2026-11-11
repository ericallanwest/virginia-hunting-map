/**
 * Virginia elk regulations, 2024-25 license year.
 * Source: 2024–2025 Hunting & Trapping in Virginia digest, p. 33
 *   https://dwr.virginia.gov/wp-content/uploads/media/2024-2025-Virginia-Hunting-and-Trapping-Regulations-Digest.pdf
 *   sha256 5174144546ede3b1249c77ba8fff93c0c22600ffaf95aad70d35594924d7bdda
 */
import { deer2024 } from './deer-2024';
import { deriveElk } from './elk';

export const elk2024 = deriveElk(deer2024, {
  lottery: ['10-12', '10-18'],
  lotteryLabel: 'Oct 12–18, 2024',
  lotteryNotes: [
    'Virginia’s third managed elk hunt: six hunters (lottery license holders) may each take a bull elk.',
    'Lottery applications are taken each spring ($15 resident, $20 nonresident).',
  ],
  source: 'https://dwr.virginia.gov/wp-content/uploads/media/2024-2025-Virginia-Hunting-and-Trapping-Regulations-Digest.pdf',
});
