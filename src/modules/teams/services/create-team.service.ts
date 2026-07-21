import { requestCreateTeam } from '../gateways/teams.gateway';
import { runTeamsRequest } from '../helpers/to-teams-error.helper';
import { mapTeam } from '../mappers/teams.mapper';
import type { CreateTeamInput, Team } from '../types/teams.types';

/** Use case: create a team. Platform-scoped: needs `team.create`. */
export function createTeam(input: CreateTeamInput): Promise<Team> {
  return runTeamsRequest(async () => mapTeam(await requestCreateTeam(input)));
}
