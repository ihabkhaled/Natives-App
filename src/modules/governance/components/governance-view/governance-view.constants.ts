import { TEST_IDS } from '@/shared/config';

/** The state test ids the shared AsyncStateView stamps on this screen. */
export const GOVERNANCE_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.governanceLoading,
  errorTestId: TEST_IDS.governanceError,
  offlineTestId: TEST_IDS.governanceOffline,
  forbiddenTestId: TEST_IDS.governanceForbidden,
  emptyTestId: TEST_IDS.governanceEmpty,
} as const;
