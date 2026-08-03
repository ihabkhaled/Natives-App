import { listAssignableRoles } from '../services/list-assignable-roles.service';
import type { AssignableRole } from '../types/role-assignments.types';
import { roleAssignmentsQueryKeys } from './role-assignments.keys';

/**
 * Query options for the actor's grantable-role catalog in one team.
 *
 * Read only when the actor may actually grant. Fetching a privilege ceiling
 * for someone who cannot use it is a pointless 403 in the console, and the
 * empty catalog it would leave behind reads like "you may grant nothing"
 * rather than "you may not grant here".
 */
export function buildAssignableRolesQueryOptions(
  teamId: string,
  enabled: boolean,
): {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<readonly AssignableRole[]>;
  readonly enabled: boolean;
} {
  return {
    queryKey: roleAssignmentsQueryKeys.assignableRoles(teamId),
    queryFn: (): Promise<readonly AssignableRole[]> => listAssignableRoles(teamId),
    enabled: enabled && teamId !== '',
  };
}
