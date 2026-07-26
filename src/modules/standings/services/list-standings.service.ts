import { requestStandings } from '../gateways/standings.gateway';
import { runStandingsRequest } from '../helpers/to-standings-error.helper';
import { mapStandingsPage } from '../mappers/standings.mapper';
import type { StandingsFilters, StandingsPage } from '../types/standings.types';

/** Use case: one competition's table, sorted by the rule it was computed under. */
export function listStandings(teamId: string, filters: StandingsFilters): Promise<StandingsPage> {
  return runStandingsRequest(async () => mapStandingsPage(await requestStandings(teamId, filters)));
}
