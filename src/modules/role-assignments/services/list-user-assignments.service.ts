import { requestUserAssignments } from '../gateways/role-assignments.gateway';
import type { UserAssignments } from '../types/role-assignments.types';

/** Use case: every role one user holds, in every scope, as the server sees it. */
export function listUserAssignments(userId: string): Promise<UserAssignments> {
  return requestUserAssignments(userId);
}
