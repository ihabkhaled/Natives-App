import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { PERMISSIONS } from '@/shared/security';

export interface TeamsContextView {
  readonly teamId: string;
  readonly isOffline: boolean;
  readonly isLoading: boolean;
  /** `team.read` — reading one team and its seasons, in a team scope. */
  readonly canReadTeams: boolean;
  /** `team.browse.all` — the PLATFORM read of every team; a team admin has none. */
  readonly canBrowseAllTeams: boolean;
  /** `team.create` — the PLATFORM write; a team admin gets 403 by design. */
  readonly canCreateTeams: boolean;
  /** `team.settings.manage` — the create/update/archive verbs on teams. */
  readonly canManageTeams: boolean;
  /** `season.manage` — the create/update/archive verbs on seasons. */
  readonly canManageSeasons: boolean;
  /** `member.roles.manage` — the gate the role-matrix endpoint enforces. */
  readonly canReadRoleMatrix: boolean;
}

/**
 * The scope, grants, and connectivity the team and season screens need. Each
 * capability names the exact backend permission its endpoint enforces, so a
 * hidden control and a 403 can never disagree about why.
 */
export function useTeamsContext(): TeamsContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();
  const granted = permissions.permissions;
  return {
    teamId: scope.teamId,
    isOffline: !network.isOnline,
    isLoading: scope.isLoading || permissions.isLoading,
    canReadTeams: granted.includes(PERMISSIONS.teamRead),
    canBrowseAllTeams: granted.includes(PERMISSIONS.teamBrowseAll),
    canCreateTeams: granted.includes(PERMISSIONS.teamCreate),
    canManageTeams: granted.includes(PERMISSIONS.settingsManage),
    canManageSeasons: granted.includes(PERMISSIONS.seasonManage),
    canReadRoleMatrix: granted.includes(PERMISSIONS.memberRolesManage),
  };
}
