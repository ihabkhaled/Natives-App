import { TEST_IDS } from '@/shared/config';

/**
 * Derived selectors for the grant form. The registry publishes one action id
 * for this screen, so the form's two controls are suffixed off it.
 */
export const GRANT_PANEL_TEST_IDS = {
  role: `${TEST_IDS.roleAssignmentsAction}-role`,
  submit: `${TEST_IDS.roleAssignmentsAction}-grant`,
} as const;
