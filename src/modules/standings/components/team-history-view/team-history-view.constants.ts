import { TEST_IDS } from '@/shared/config';

/** The five designed states the trophy cabinet can present. */
export const TEAM_HISTORY_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.teamHistoryLoading,
  errorTestId: TEST_IDS.teamHistoryError,
  offlineTestId: TEST_IDS.teamHistoryOffline,
  forbiddenTestId: TEST_IDS.teamHistoryForbidden,
  emptyTestId: TEST_IDS.teamHistoryEmpty,
} as const;
