import { TEST_IDS } from '@/shared/config';

/** The five designed async states this screen can present. */
export const ROLE_ASSIGNMENTS_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.roleAssignmentsLoading,
  errorTestId: TEST_IDS.roleAssignmentsError,
  offlineTestId: TEST_IDS.roleAssignmentsOffline,
  forbiddenTestId: TEST_IDS.roleAssignmentsForbidden,
  emptyTestId: TEST_IDS.roleAssignmentsEmpty,
} as const;

/** The name the target-user input reports to the form layer. */
export const TARGET_USER_FIELD_NAME = 'role-assignments-user-id';

/**
 * The field that steers the whole screen. The registry publishes one action id
 * for this surface, so the target input is suffixed off it.
 */
export const TARGET_USER_TEST_ID = `${TEST_IDS.roleAssignmentsAction}-user`;
