import { TEST_IDS } from '@/shared/config';

/** The five designed async states the operations centre can present. */
export const OPS_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.adminOpsLoading,
  errorTestId: TEST_IDS.adminOpsError,
  offlineTestId: TEST_IDS.adminOpsOffline,
  forbiddenTestId: TEST_IDS.adminOpsForbidden,
  emptyTestId: TEST_IDS.adminOpsEmpty,
} as const;
