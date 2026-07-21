import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { matchesQueryKeys } from '../queries/matches.keys';
import { finalizeMatch } from '../services/finalize-match.service';
import type { FinalizeMatchCommand, Match } from '../types/matches.types';

export interface FinalizeMatchCallbacks {
  readonly onSuccess: () => void;
  readonly onError: () => void;
}

/**
 * Publish the final score. The client refuses to call this while anything is
 * still queued or the projection is stale; the backend then enforces
 * immutability at the database level.
 */
export function useFinalizeMatchMutation(
  teamId: string,
  matchId: string,
  callbacks: FinalizeMatchCallbacks,
): InvalidatingMutationView<FinalizeMatchCommand> {
  return useInvalidatingMutation<Match, FinalizeMatchCommand>({
    mutationFn: (command) => finalizeMatch(teamId, matchId, command),
    invalidateKey: matchesQueryKeys.detail(teamId, matchId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
