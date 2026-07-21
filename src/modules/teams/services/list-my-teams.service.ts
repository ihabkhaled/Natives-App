import { requestMyTeams } from '../gateways/teams.gateway';
import { runTeamsRequest } from '../helpers/to-teams-error.helper';
import { mapTeam } from '../mappers/teams.mapper';
import type { Team } from '../types/teams.types';

/** Use case: the caller's own teams — the team-scoped read every member may do. */
export function listMyTeams(): Promise<readonly Team[]> {
  return runTeamsRequest(async () => (await requestMyTeams()).items.map(mapTeam));
}
