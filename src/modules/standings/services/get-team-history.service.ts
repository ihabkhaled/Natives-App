import { requestTeamHistory } from '../gateways/achievements.gateway';
import { runStandingsRequest } from '../helpers/to-standings-error.helper';
import { mapTeamHistoryPage } from '../mappers/achievements.mapper';
import type { TeamHistoryFilters, TeamHistoryPage } from '../types/achievements.types';

/** Use case: one cabinet page — the server only ever returns approved entries. */
export function getTeamHistory(
  teamId: string,
  filters: TeamHistoryFilters,
  offset: number,
): Promise<TeamHistoryPage> {
  return runStandingsRequest(async () =>
    mapTeamHistoryPage(await requestTeamHistory(teamId, filters, offset)),
  );
}
