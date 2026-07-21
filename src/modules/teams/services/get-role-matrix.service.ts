import { requestRoleMatrix } from '../gateways/teams.gateway';
import { runTeamsRequest } from '../helpers/to-teams-error.helper';
import { mapRoleMatrix } from '../mappers/teams.mapper';
import type { RoleMatrix } from '../types/teams.types';

/**
 * Use case: the seeded role x permission matrix behind the access screens.
 * The team scope is passed through so a team administrator's grant satisfies
 * the endpoint's `member.roles.manage` check.
 */
export function getRoleMatrix(teamId: string): Promise<RoleMatrix> {
  return runTeamsRequest(async () => mapRoleMatrix(await requestRoleMatrix(teamId)));
}
