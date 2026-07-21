import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { matchesQueryKeys } from '../queries/matches.keys';
import { transitionMatch } from '../services/transition-match.service';
import type { Match, MatchTransitionCommand } from '../types/matches.types';

export interface MatchTransitionCallbacks {
  readonly onSuccess: () => void;
  readonly onError: () => void;
}

/**
 * Move the match through its server-owned state machine. The record version
 * the client last saw travels with the request, so a stale transition is
 * rejected rather than applied out of order.
 */
export function useMatchTransitionMutation(
  teamId: string,
  matchId: string,
  callbacks: MatchTransitionCallbacks,
): InvalidatingMutationView<MatchTransitionCommand> {
  return useInvalidatingMutation<Match, MatchTransitionCommand>({
    mutationFn: (command) => transitionMatch(teamId, matchId, command),
    invalidateKey: matchesQueryKeys.detail(teamId, matchId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
