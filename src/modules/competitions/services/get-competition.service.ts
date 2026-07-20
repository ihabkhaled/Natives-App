import { requestCompetition } from '../gateways/competitions.gateway';
import { runRequest } from '@/shared/errors';
import { mapCompetition } from '../mappers/competition.mapper';
import type { Competition } from '../types/competitions.types';

/** Use case: one competition, re-authorized server-side on every read. */
export function getCompetition(teamId: string, competitionId: string): Promise<Competition> {
  return runRequest(async () => mapCompetition(await requestCompetition(teamId, competitionId)));
}
