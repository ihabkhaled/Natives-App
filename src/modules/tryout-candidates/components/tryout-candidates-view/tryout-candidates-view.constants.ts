import { TEST_IDS } from '@/shared/config';

/** The state test ids the shared AsyncStateView stamps on this screen. */
export const TRYOUT_CANDIDATES_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.tryoutCandidatesLoading,
  errorTestId: TEST_IDS.tryoutCandidatesError,
  offlineTestId: TEST_IDS.tryoutCandidatesOffline,
  forbiddenTestId: TEST_IDS.tryoutCandidatesForbidden,
  emptyTestId: TEST_IDS.tryoutCandidatesEmpty,
} as const;
