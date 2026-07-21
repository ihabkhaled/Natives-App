import { requestUpdateTeam } from '../gateways/teams.gateway';
import { runTeamsRequest } from '../helpers/to-teams-error.helper';
import { mapTeam } from '../mappers/teams.mapper';
import type { Team, UpdateTeamInput } from '../types/teams.types';

/** Use case: rename or re-brand a team, guarded by optimistic concurrency. */
export function updateTeam(teamId: string, input: UpdateTeamInput): Promise<Team> {
  return runTeamsRequest(async () => mapTeam(await requestUpdateTeam(teamId, input)));
}
