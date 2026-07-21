import { runRequest } from '@/shared/errors';

import { requestMatchScoreboard } from '../gateways/matches.gateway';
import { mapMatchScoreboard } from '../mappers/match.mapper';
import type { MatchScoreboard } from '../types/matches.types';

/** Use case: the authoritative score, caps, and timeout allowance. */
export function getMatchScoreboard(teamId: string, matchId: string): Promise<MatchScoreboard> {
  return runRequest(async () => mapMatchScoreboard(await requestMatchScoreboard(teamId, matchId)));
}
