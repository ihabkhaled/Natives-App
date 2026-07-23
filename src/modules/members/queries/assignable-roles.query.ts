import { listAssignableRoles } from '../services/list-assignable-roles.service';
import { membersQueryKeys } from './members.keys';

/** Query options for the server-driven role catalog the actor may grant. */
export function buildAssignableRolesQueryOptions(teamId: string, enabled: boolean) {
  return {
    queryKey: membersQueryKeys.assignableRoles(teamId),
    queryFn: () => listAssignableRoles(teamId),
    enabled: enabled && teamId !== '',
  };
}
