import { TEST_IDS } from '@/shared/config';

/** The five designed async states the seasons screen can present. */
export const SEASONS_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.seasonsLoading,
  errorTestId: TEST_IDS.seasonsError,
  offlineTestId: TEST_IDS.seasonsOffline,
  forbiddenTestId: TEST_IDS.seasonsForbidden,
  emptyTestId: TEST_IDS.seasonsEmpty,
} as const;
