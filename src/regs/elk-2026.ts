/**
 * Virginia elk regulations, 2026-27 license year.
 * Sources: https://dwr.virginia.gov/wildlife/elk/hunting/ and .../elk-hunting/elk-lottery/
 *          (snapshots in sources/regs/elk-hunting.html, elk-lottery.html)
 */
import { deer2026 } from './deer-2026';
import { deriveElk } from './elk';

export const elk2026 = deriveElk(deer2026, {
  lottery: ['10-10', '10-16'],
  lotteryLabel: 'Oct 10–16, 2026',
  lotteryNotes: [
    'Only holders of a special elk license (5 by lottery + 1 conservation license). Antlered bulls only; 1 elk per license year.',
    'Lottery applications open each February–March.',
  ],
  source: 'https://dwr.virginia.gov/wildlife/elk/hunting/',
});
