import { TEST_IDS } from '@/shared/config';

/** The five designed states the reports center can present. */
export const REPORTS_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.reportsLoading,
  errorTestId: TEST_IDS.reportsError,
  offlineTestId: TEST_IDS.reportsOffline,
  forbiddenTestId: TEST_IDS.reportsForbidden,
  emptyTestId: TEST_IDS.reportsEmpty,
} as const;
