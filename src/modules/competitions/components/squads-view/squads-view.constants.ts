import { TEST_IDS } from '@/shared/config';

/** The five designed async states the squad screens present. */
export const SQUADS_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.competitionsLoading,
  errorTestId: TEST_IDS.competitionsError,
  offlineTestId: TEST_IDS.competitionsOffline,
  forbiddenTestId: TEST_IDS.competitionsForbidden,
  emptyTestId: TEST_IDS.competitionsEmpty,
} as const;
