import { TEST_IDS } from '@/shared/config';

/** The three controls of the withdrawal step. */
export const WITHDRAWAL_TEST_IDS = {
  reason: `${TEST_IDS.tryoutCandidatesAction}-reason`,
  confirm: `${TEST_IDS.tryoutCandidatesAction}-confirm`,
  cancel: `${TEST_IDS.tryoutCandidatesAction}-cancel`,
} as const;
