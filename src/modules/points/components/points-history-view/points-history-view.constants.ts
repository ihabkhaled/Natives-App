import { TEST_IDS } from '@/shared/config';

/** The five designed states the personal ledger can present. */
export const POINTS_HISTORY_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.pointsHistoryLoading,
  errorTestId: TEST_IDS.pointsHistoryError,
  offlineTestId: TEST_IDS.pointsHistoryOffline,
  forbiddenTestId: TEST_IDS.pointsHistoryForbidden,
  emptyTestId: TEST_IDS.pointsHistoryEmpty,
} as const;
