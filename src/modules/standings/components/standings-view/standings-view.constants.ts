import { TEST_IDS } from '@/shared/config';

/** The five designed states the standings screen can present. */
export const STANDINGS_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.standingsLoading,
  errorTestId: TEST_IDS.standingsError,
  offlineTestId: TEST_IDS.standingsOffline,
  forbiddenTestId: TEST_IDS.standingsForbidden,
  emptyTestId: TEST_IDS.standingsEmpty,
} as const;
