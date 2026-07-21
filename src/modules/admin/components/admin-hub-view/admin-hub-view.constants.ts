import { TEST_IDS } from '@/shared/config';

/** The five designed async states the admin hub can present. */
export const ADMIN_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.loadingState,
  errorTestId: TEST_IDS.errorState,
  offlineTestId: TEST_IDS.offlineState,
  forbiddenTestId: TEST_IDS.permissionState,
  emptyTestId: TEST_IDS.emptyState,
} as const;
