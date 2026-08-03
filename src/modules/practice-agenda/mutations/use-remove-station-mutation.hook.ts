import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { practiceAgendaQueryKeys } from '../queries/practice-agenda.keys';
import { removeAgendaStation } from '../services/remove-agenda-station.service';
import type {
  AgendaMutationScope,
  PracticeAgendaMutationCallbacks,
  RemoveStationInput,
} from './practice-agenda-mutations.types';

/**
 * Drop one station from a block. Unlike the reorder there is nothing
 * optimistic here: the row disappears once the server confirms, so a coach is
 * never shown a plan the session will not actually run.
 */
export function useRemoveStationMutation(
  scope: AgendaMutationScope,
  callbacks: PracticeAgendaMutationCallbacks,
): InvalidatingMutationView<RemoveStationInput> {
  return useInvalidatingMutation<null, RemoveStationInput>({
    // The endpoint answers 204, so there is nothing to hand back; the refreshed
    // plan is the result.
    mutationFn: async (input) => {
      await removeAgendaStation({
        teamId: scope.teamId,
        sessionId: scope.sessionId,
        blockId: input.blockId,
        stationId: input.stationId,
      });
      return null;
    },
    invalidateKey: practiceAgendaQueryKeys.agenda(scope.teamId, scope.sessionId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
