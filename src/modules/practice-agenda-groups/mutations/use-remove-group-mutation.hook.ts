import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { practiceAgendaGroupsQueryKeys } from '../queries/practice-agenda-groups.keys';
import { removeGroup } from '../services/remove-group.service';
import type {
  AgendaGroupsMutationCallbacks,
  AgendaGroupsMutationScope,
  RemoveGroupInput,
} from './practice-agenda-groups-mutations.types';

/**
 * Drop a group entirely. Nothing optimistic: the row disappears once the
 * server confirms, and the invalidated plan re-read is the proof.
 */
export function useRemoveGroupMutation(
  scope: AgendaGroupsMutationScope,
  callbacks: AgendaGroupsMutationCallbacks,
): InvalidatingMutationView<RemoveGroupInput> {
  return useInvalidatingMutation<undefined, RemoveGroupInput>({
    mutationFn: async (input) => {
      await removeGroup({
        teamId: scope.teamId,
        sessionId: scope.sessionId,
        groupId: input.groupId,
      });
      return undefined;
    },
    invalidateKey: practiceAgendaGroupsQueryKeys.plan(scope.teamId, scope.sessionId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
