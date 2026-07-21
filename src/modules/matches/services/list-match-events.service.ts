import { runRequest } from '@/shared/errors';

import { requestMatchEvents } from '../gateways/match-events.gateway';
import { mapMatchEvents } from '../mappers/match.mapper';
import type { MatchEvent } from '../types/matches.types';

/** Use case: the append-only event stream, newest first. */
export function listMatchEvents(teamId: string, matchId: string): Promise<readonly MatchEvent[]> {
  return runRequest(async () => mapMatchEvents(await requestMatchEvents(teamId, matchId)));
}
