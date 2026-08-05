import type { AgendaSummary } from '@/modules/practice-agenda';
import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { practiceAgendaGroupsQueryKeys } from '../queries/practice-agenda-groups.keys';
import { copyAgenda } from '../services/copy-agenda.service';
import type {
  AgendaGroupsMutationCallbacks,
  AgendaGroupsMutationScope,
  CopyAgendaInput,
} from './practice-agenda-groups-mutations.types';

/**
 * Replace this session's agenda with another session's. The answer is the
 * agenda header only, so the invalidated plan re-read is what shows the
 * blocks and groups that actually landed.
 */
export function useCopyAgendaMutation(
  scope: AgendaGroupsMutationScope,
  callbacks: AgendaGroupsMutationCallbacks,
): InvalidatingMutationView<CopyAgendaInput> {
  return useInvalidatingMutation<AgendaSummary, CopyAgendaInput>({
    mutationFn: (input) =>
      copyAgenda({
        teamId: scope.teamId,
        sessionId: scope.sessionId,
        sourceSessionId: input.sourceSessionId,
      }),
    invalidateKey: practiceAgendaGroupsQueryKeys.plan(scope.teamId, scope.sessionId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
