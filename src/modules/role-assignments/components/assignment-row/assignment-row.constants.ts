import { TEST_IDS } from '@/shared/config';

/**
 * The screen's registry publishes one action selector; the revoke button is
 * addressed per assignment so a spec can name the exact grant it is ending.
 */
export function revokeActionTestId(assignmentId: string): string {
  return `${TEST_IDS.roleAssignmentsAction}-${assignmentId}`;
}
