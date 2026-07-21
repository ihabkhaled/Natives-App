import { TEST_IDS } from '@/shared/config';

/** The five designed async states the permissions matrix can present. */
export const MATRIX_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.permissionsMatrixLoading,
  errorTestId: TEST_IDS.permissionsMatrixError,
  offlineTestId: TEST_IDS.permissionsMatrixOffline,
  forbiddenTestId: TEST_IDS.permissionsMatrixForbidden,
  emptyTestId: TEST_IDS.permissionsMatrixEmpty,
} as const;
