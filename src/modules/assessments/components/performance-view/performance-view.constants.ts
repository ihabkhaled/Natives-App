import { TEST_IDS } from '@/shared/config';

export const PERFORMANCE_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.performanceLoading,
  errorTestId: TEST_IDS.performanceError,
  offlineTestId: TEST_IDS.performanceOffline,
  forbiddenTestId: TEST_IDS.performanceForbidden,
  emptyTestId: TEST_IDS.performanceEmpty,
} as const;
