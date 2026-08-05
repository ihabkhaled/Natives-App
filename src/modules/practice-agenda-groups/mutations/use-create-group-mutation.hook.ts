import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { practiceAgendaGroupsQueryKeys } from '../queries/practice-agenda-groups.keys';
import { createGroup } from '../services/create-group.service';
import type { AgendaGroup } from '../types/practice-agenda-groups.types';
import type {
  AgendaGroupsMutationCallbacks,
  AgendaGroupsMutationScope,
  CreateGroupInput,
} from './practice-agenda-groups-mutations.types';

/** Start a new group. The plan re-read is what puts it on screen. */
export function useCreateGroupMutation(
  scope: AgendaGroupsMutationScope,
  callbacks: AgendaGroupsMutationCallbacks,
): InvalidatingMutationView<CreateGroupInput> {
  return useInvalidatingMutation<AgendaGroup, CreateGroupInput>({
    mutationFn: (input) =>
      createGroup({
        teamId: scope.teamId,
        sessionId: scope.sessionId,
        name: input.name,
        color: input.color,
        coachMembershipId: input.coachMembershipId,
        notes: input.notes,
      }),
    invalidateKey: practiceAgendaGroupsQueryKeys.plan(scope.teamId, scope.sessionId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
