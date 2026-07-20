import { requestCompetitionFixtures } from '../gateways/competitions.gateway';
import { runRequest } from '@/shared/errors';
import { mapFixturePage } from '../mappers/competition.mapper';
import type { FixturePage } from '../types/competitions.types';

/** Use case: one bounded page of a competition's fixtures. */
export function listFixtures(teamId: string, competitionId: string): Promise<FixturePage> {
  return runRequest(async () =>
    mapFixturePage(await requestCompetitionFixtures(teamId, competitionId)),
  );
}
