import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { roleAssignmentsQueryKeys } from '../queries/role-assignments.keys';
import { assignRole } from '../services/assign-role.service';
import type { AssignRoleCommand, RoleAssignment } from '../types/role-assignments.types';
import type { RoleAssignmentsMutationCallbacks } from './role-assignments-mutations.types';

/** The scope every grant from this screen lands in — never a platform grant. */
export interface GrantScope {
  readonly teamId: string;
  readonly seasonId: string | null;
}

/** What the screen hands over once the draft has cleared the ceiling check. */
export interface GrantInput {
  readonly userId: string;
  readonly roleKey: string;
}

/**
 * Grant one role.
 *
 * Invalidates the whole module branch rather than just the target user's list:
 * a grant can change what the ACTOR may hand on next, so the assignable-roles
 * catalog is re-read too instead of showing a ceiling that no longer holds.
 */
export function useAssignRoleMutation(
  scope: GrantScope,
  callbacks: RoleAssignmentsMutationCallbacks,
): InvalidatingMutationView<GrantInput> {
  return useInvalidatingMutation<RoleAssignment, GrantInput>({
    mutationFn: (input): Promise<RoleAssignment> => {
      const command: AssignRoleCommand = {
        userId: input.userId,
        roleKey: input.roleKey,
        teamId: scope.teamId,
        seasonId: scope.seasonId,
      };
      return assignRole(command);
    },
    invalidateKey: roleAssignmentsQueryKeys.all,
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
