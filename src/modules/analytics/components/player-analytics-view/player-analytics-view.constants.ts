import { TEST_IDS } from '@/shared/config';

/** The five designed states the player analytics screen can present. */
export const PLAYER_ANALYTICS_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.playerAnalyticsLoading,
  errorTestId: TEST_IDS.playerAnalyticsError,
  offlineTestId: TEST_IDS.playerAnalyticsOffline,
  forbiddenTestId: TEST_IDS.playerAnalyticsForbidden,
  emptyTestId: TEST_IDS.playerAnalyticsEmpty,
} as const;
