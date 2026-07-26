import { TEST_IDS } from '@/shared/config';

/** The five designed states the team analytics screen can present. */
export const TEAM_ANALYTICS_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.analyticsLoading,
  errorTestId: TEST_IDS.analyticsError,
  offlineTestId: TEST_IDS.analyticsOffline,
  forbiddenTestId: TEST_IDS.analyticsForbidden,
  emptyTestId: TEST_IDS.analyticsEmpty,
} as const;
