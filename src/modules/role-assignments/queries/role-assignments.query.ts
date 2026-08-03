import { listUserAssignments } from '../services/list-user-assignments.service';
import type { UserAssignments } from '../types/role-assignments.types';
import { roleAssignmentsQueryKeys } from './role-assignments.keys';

/**
 * Query options for one user's assignments.
 *
 * Disabled until a target is named: an empty user id would otherwise resolve
 * to `/rbac/users//assignments`, a request no administrator asked for.
 */
export function buildUserAssignmentsQueryOptions(userId: string): {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<UserAssignments>;
  readonly enabled: boolean;
} {
  return {
    queryKey: roleAssignmentsQueryKeys.user(userId),
    queryFn: (): Promise<UserAssignments> => listUserAssignments(userId),
    enabled: userId !== '',
  };
}
