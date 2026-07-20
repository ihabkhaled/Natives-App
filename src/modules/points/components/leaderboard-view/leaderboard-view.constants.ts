import { TEST_IDS } from '@/shared/config';

/** The five designed states the leaderboard can present. */
export const LEADERBOARD_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.leaderboardLoading,
  errorTestId: TEST_IDS.leaderboardError,
  offlineTestId: TEST_IDS.leaderboardOffline,
  forbiddenTestId: TEST_IDS.leaderboardForbidden,
  emptyTestId: TEST_IDS.leaderboardEmpty,
} as const;
