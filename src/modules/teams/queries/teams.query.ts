import { getRoleMatrix } from '../services/get-role-matrix.service';
import { listSeasons } from '../services/list-seasons.service';
import { listTeams } from '../services/list-teams.service';
import { teamsQueryKeys } from './teams.keys';

/**
 * Query options for the platform-wide team list. Gated on `team.browse.all`:
 * without it the request is a guaranteed 403, so it is never issued.
 */
export function buildTeamsQueryOptions(enabled: boolean) {
  return { queryKey: teamsQueryKeys.list(), queryFn: () => listTeams(), enabled };
}

/** Query options for one team's seasons. */
export function buildSeasonsQueryOptions(teamId: string, enabled: boolean) {
  return {
    queryKey: teamsQueryKeys.seasons(teamId),
    queryFn: () => listSeasons(teamId),
    enabled: enabled && teamId !== '',
  };
}

/** Query options for the seeded role x permission matrix, in the active scope. */
export function buildRoleMatrixQueryOptions(teamId: string, enabled: boolean) {
  return {
    queryKey: teamsQueryKeys.roleMatrix(teamId),
    queryFn: () => getRoleMatrix(teamId),
    enabled,
  };
}
