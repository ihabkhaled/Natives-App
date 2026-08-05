import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { practiceAgendaGroupsQueryKeys } from '../queries/practice-agenda-groups.keys';
import { removeGroupMember } from '../services/remove-group-member.service';
import type {
  AgendaGroupsMutationCallbacks,
  AgendaGroupsMutationScope,
  RemoveGroupMemberInput,
} from './practice-agenda-groups-mutations.types';

/** Drop one membership from a group; the session and its roster are untouched. */
export function useRemoveGroupMemberMutation(
  scope: AgendaGroupsMutationScope,
  callbacks: AgendaGroupsMutationCallbacks,
): InvalidatingMutationView<RemoveGroupMemberInput> {
  return useInvalidatingMutation<undefined, RemoveGroupMemberInput>({
    mutationFn: async (input) => {
      await removeGroupMember({
        teamId: scope.teamId,
        sessionId: scope.sessionId,
        groupId: input.groupId,
        membershipId: input.membershipId,
      });
      return undefined;
    },
    invalidateKey: practiceAgendaGroupsQueryKeys.plan(scope.teamId, scope.sessionId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
