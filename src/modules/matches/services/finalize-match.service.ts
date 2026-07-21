import { runRequest } from '@/shared/errors';

import { requestMatchFinalization } from '../gateways/matches.gateway';
import { mapMatch } from '../mappers/match.mapper';
import type { FinalizeMatchCommand, Match } from '../types/matches.types';

/** Use case: publish the final score. The backend makes it immutable after. */
export function finalizeMatch(
  teamId: string,
  matchId: string,
  command: FinalizeMatchCommand,
): Promise<Match> {
  return runRequest(async () => mapMatch(await requestMatchFinalization(teamId, matchId, command)));
}
