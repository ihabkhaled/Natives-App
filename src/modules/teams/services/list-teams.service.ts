import { requestTeams } from '../gateways/teams.gateway';
import { runTeamsRequest } from '../helpers/to-teams-error.helper';
import { mapTeam } from '../mappers/teams.mapper';
import type { Team } from '../types/teams.types';

/**
 * Use case: every team on the platform.
 *
 * A platform-scoped read: only `team.browse.all` satisfies it, and a team
 * administrator gets a 403 by design. `listMyTeams` is the read every member
 * may perform.
 */
export function listTeams(): Promise<readonly Team[]> {
  return runTeamsRequest(async () => (await requestTeams()).items.map(mapTeam));
}
