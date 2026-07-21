import { runRequest } from '@/shared/errors';

import { requestMatchStatistics } from '../gateways/match-statistics.gateway';
import { mapMatchStatistics } from '../mappers/match-statistics.mapper';
import type { MatchStatistics } from '../types/matches.types';

/** Use case: the server-derived per-team and per-player statistics. */
export function getMatchStatistics(teamId: string, matchId: string): Promise<MatchStatistics> {
  return runRequest(async () => mapMatchStatistics(await requestMatchStatistics(teamId, matchId)));
}
