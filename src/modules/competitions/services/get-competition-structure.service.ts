import { requestCompetitionStructure } from '../gateways/competitions.gateway';
import { runRequest } from '@/shared/errors';
import { mapCompetitionStructure } from '../mappers/competition.mapper';
import type { CompetitionStructure } from '../types/competitions.types';

/** Use case: the published stage and round structure, in playing order. */
export function getCompetitionStructure(
  teamId: string,
  competitionId: string,
): Promise<CompetitionStructure> {
  return runRequest(async () =>
    mapCompetitionStructure(await requestCompetitionStructure(teamId, competitionId)),
  );
}
