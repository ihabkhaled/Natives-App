import { runRequest } from '@/shared/errors';

import { requestMatchTransition } from '../gateways/matches.gateway';
import { mapMatch } from '../mappers/match.mapper';
import type { Match, MatchTransitionCommand } from '../types/matches.types';

/** Use case: move the match through its server-owned state machine. */
export function transitionMatch(
  teamId: string,
  matchId: string,
  command: MatchTransitionCommand,
): Promise<Match> {
  return runRequest(async () => mapMatch(await requestMatchTransition(teamId, matchId, command)));
}
