import { useInvalidatingMutation } from '@/packages/query';

import { competitionsQueryKeys } from '../queries/competitions.keys';
import { transitionSquad } from '../services/transition-squad.service';
import type { Squad, TransitionSquadCommand } from '../types/competitions.types';
import type { CompetitionsMutationCallbacks } from '../types/competitions-view.types';
import type { TransitionMutationView } from '../types/selection.types';

/** Publish, lock, revise, or archive a squad with optimistic-concurrency safety. */
export function useTransitionSquadMutation(
  teamId: string,
  squadId: string,
  callbacks: CompetitionsMutationCallbacks,
): TransitionMutationView {
  return useInvalidatingMutation<Squad, TransitionSquadCommand>({
    mutationFn: (command) => transitionSquad(teamId, squadId, command),
    invalidateKey: competitionsQueryKeys.squad(teamId, squadId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
