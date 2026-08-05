import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { practiceAgendaGroupsQueryKeys } from '../queries/practice-agenda-groups.keys';
import { assignGroupMembers } from '../services/assign-group-members.service';
import type { AgendaGroup } from '../types/practice-agenda-groups.types';
import type {
  AgendaGroupsMutationCallbacks,
  AgendaGroupsMutationScope,
  AssignGroupMembersInput,
} from './practice-agenda-groups-mutations.types';

/** Add memberships to a group; the plan re-read is what shows the new roster. */
export function useAssignGroupMembersMutation(
  scope: AgendaGroupsMutationScope,
  callbacks: AgendaGroupsMutationCallbacks,
): InvalidatingMutationView<AssignGroupMembersInput> {
  return useInvalidatingMutation<AgendaGroup, AssignGroupMembersInput>({
    mutationFn: (input) =>
      assignGroupMembers({
        teamId: scope.teamId,
        sessionId: scope.sessionId,
        groupId: input.groupId,
        membershipIds: input.membershipIds,
      }),
    invalidateKey: practiceAgendaGroupsQueryKeys.plan(scope.teamId, scope.sessionId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
