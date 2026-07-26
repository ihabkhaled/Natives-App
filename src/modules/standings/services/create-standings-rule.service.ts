import { requestCreateStandingsRule } from '../gateways/standings.gateway';
import { runStandingsRequest } from '../helpers/to-standings-error.helper';
import { mapStandingsRule } from '../mappers/standings.mapper';
import type { CreateStandingsRuleCommand, StandingsRule } from '../types/standings.types';

/** Use case: publish version N+1 of a rule family — never edit a version. */
export function createStandingsRule(
  teamId: string,
  command: CreateStandingsRuleCommand,
): Promise<StandingsRule> {
  return runStandingsRequest(async () =>
    mapStandingsRule(await requestCreateStandingsRule(teamId, command)),
  );
}
