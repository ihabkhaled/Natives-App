import { TEST_IDS } from '@/shared/config';

/** The five designed async states the roles screen can present. */
export const ROLES_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.adminRolesLoading,
  errorTestId: TEST_IDS.adminRolesError,
  offlineTestId: TEST_IDS.adminRolesOffline,
  forbiddenTestId: TEST_IDS.adminRolesForbidden,
  emptyTestId: TEST_IDS.adminRolesEmpty,
} as const;
