import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { practiceAgendaQueryKeys } from '../queries/practice-agenda.keys';
import { reorderAgendaBlocks } from '../services/reorder-agenda-blocks.service';
import type { AgendaSummary } from '../types/practice-agenda.types';
import type {
  AgendaMutationScope,
  PracticeAgendaMutationCallbacks,
  ReorderBlocksInput,
} from './practice-agenda-mutations.types';

/**
 * Commit the plan's running order.
 *
 * Invalidating the session's branch on settle is what makes the optimistic
 * order provisional: whatever the coach drew is replaced by the order the
 * server re-reports, so an accepted move and a refused one both end on the
 * server's answer rather than on the client's guess.
 */
export function useReorderBlocksMutation(
  scope: AgendaMutationScope,
  callbacks: PracticeAgendaMutationCallbacks,
): InvalidatingMutationView<ReorderBlocksInput> {
  return useInvalidatingMutation<AgendaSummary, ReorderBlocksInput>({
    mutationFn: (input) =>
      reorderAgendaBlocks({
        teamId: scope.teamId,
        sessionId: scope.sessionId,
        blockIds: input.blockIds,
        expectedVersion: input.expectedVersion,
      }),
    invalidateKey: practiceAgendaQueryKeys.agenda(scope.teamId, scope.sessionId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
