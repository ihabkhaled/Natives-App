import { requestStandingsRules } from '../gateways/standings.gateway';
import { runStandingsRequest } from '../helpers/to-standings-error.helper';
import { mapStandingsRulesPage } from '../mappers/standings.mapper';
import type { StandingsRulesPage } from '../types/standings.types';

/** Use case: every published rule version the team has ever computed under. */
export function listStandingsRules(teamId: string): Promise<StandingsRulesPage> {
  return runStandingsRequest(async () =>
    mapStandingsRulesPage(await requestStandingsRules(teamId)),
  );
}
