import { runRequest } from '@/shared/errors';

import { requestMatches } from '../gateways/matches.gateway';
import { mapMatchPage } from '../mappers/match.mapper';
import type { MatchPage } from '../types/matches.types';

/** Use case: one bounded page of the team's matches. */
export function listMatches(teamId: string): Promise<MatchPage> {
  return runRequest(async () => mapMatchPage(await requestMatches(teamId)));
}
