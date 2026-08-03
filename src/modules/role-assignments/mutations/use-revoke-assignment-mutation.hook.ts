import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { roleAssignmentsQueryKeys } from '../queries/role-assignments.keys';
import { revokeAssignment } from '../services/revoke-assignment.service';
import type { RoleAssignmentsMutationCallbacks } from './role-assignments-mutations.types';

/**
 * Revoke one assignment, by id.
 *
 * There is no optimistic removal: the row disappears only once the server has
 * confirmed and the list has been re-read. Access that merely LOOKS revoked is
 * the worst possible lie for this screen to tell.
 */
export function useRevokeAssignmentMutation(
  callbacks: RoleAssignmentsMutationCallbacks,
): InvalidatingMutationView<string> {
  return useInvalidatingMutation<boolean, string>({
    mutationFn: (assignmentId) => revokeAssignment(assignmentId),
    invalidateKey: roleAssignmentsQueryKeys.all,
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
