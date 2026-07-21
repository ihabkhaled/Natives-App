import { requestUpdateSeason } from '../gateways/teams.gateway';
import { runTeamsRequest } from '../helpers/to-teams-error.helper';
import { mapSeason } from '../mappers/teams.mapper';
import type { Season, UpdateSeasonInput } from '../types/teams.types';

/** Use case: edit a season's slug, name, or window. */
export function updateSeason(
  teamId: string,
  seasonId: string,
  input: UpdateSeasonInput,
): Promise<Season> {
  return runTeamsRequest(async () => mapSeason(await requestUpdateSeason(teamId, seasonId, input)));
}
