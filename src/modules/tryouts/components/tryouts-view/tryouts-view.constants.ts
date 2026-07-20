import { TEST_IDS } from '@/shared/config';

/** The five designed async states every tryout screen presents. */
export const TRYOUTS_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.tryoutsLoading,
  errorTestId: TEST_IDS.tryoutsError,
  offlineTestId: TEST_IDS.tryoutsOffline,
  forbiddenTestId: TEST_IDS.tryoutsForbidden,
  emptyTestId: TEST_IDS.tryoutsEmpty,
} as const;
