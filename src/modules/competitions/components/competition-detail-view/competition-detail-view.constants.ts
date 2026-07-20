import { TEST_IDS } from '@/shared/config';

/** The five designed async states this screen presents. */
export const COMPETITION_DETAIL_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.competitionsLoading,
  errorTestId: TEST_IDS.competitionsError,
  offlineTestId: TEST_IDS.competitionsOffline,
  forbiddenTestId: TEST_IDS.competitionsForbidden,
  emptyTestId: TEST_IDS.competitionsEmpty,
} as const;
