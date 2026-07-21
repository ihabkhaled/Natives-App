import { requestCreateSeason } from '../gateways/teams.gateway';
import { runTeamsRequest } from '../helpers/to-teams-error.helper';
import { mapSeason } from '../mappers/teams.mapper';
import type { CreateSeasonInput, Season } from '../types/teams.types';

/** Use case: create a season inside one team. */
export function createSeason(teamId: string, input: CreateSeasonInput): Promise<Season> {
  return runTeamsRequest(async () => mapSeason(await requestCreateSeason(teamId, input)));
}
