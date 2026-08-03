import { TEST_IDS } from '@/shared/config';

/** The withdrawal affordance lives on the record, never on a list row. */
export const CANDIDATE_WITHDRAW_TEST_ID = `${TEST_IDS.tryoutCandidatesAction}-withdraw`;

/** Prefix for the restricted blocks, suffixed by the block's own key. */
export const CANDIDATE_DISCLOSURE_TEST_ID_PREFIX = TEST_IDS.tryoutCandidatesView;
