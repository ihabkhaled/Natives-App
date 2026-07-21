import { requestSeasons } from '../gateways/teams.gateway';
import { runTeamsRequest } from '../helpers/to-teams-error.helper';
import { mapSeason } from '../mappers/teams.mapper';
import type { Season } from '../types/teams.types';

/** Use case: every season defined for one team. */
export function listSeasons(teamId: string): Promise<readonly Season[]> {
  return runTeamsRequest(async () => (await requestSeasons(teamId)).items.map(mapSeason));
}
