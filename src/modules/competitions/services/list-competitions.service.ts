import { requestCompetitions } from '../gateways/competitions.gateway';
import { runRequest } from '@/shared/errors';
import { mapCompetitionPage } from '../mappers/competition.mapper';
import type { CompetitionPage } from '../types/competitions.types';

/** Use case: one bounded page of the team's competitions. */
export function listCompetitions(teamId: string): Promise<CompetitionPage> {
  return runRequest(async () => mapCompetitionPage(await requestCompetitions(teamId)));
}
