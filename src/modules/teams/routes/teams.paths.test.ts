import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';
import { PERMISSIONS } from '@/shared/security';
import { ROUTE_ACCESS } from '@/shared/types';

import { getTeamsRouteDefinitions } from './teams.routes';
import { permissionsMatrixPath, seasonsAdminPath, teamsAdminPath } from './teams.paths';

describe('teams paths', () => {
  it('derives every route from the canonical route table', () => {
    expect(teamsAdminPath()).toBe(APP_PATHS.adminTeams);
    expect(seasonsAdminPath()).toBe(APP_PATHS.adminSeasons);
    expect(permissionsMatrixPath()).toBe(APP_PATHS.adminPermissions);
  });
});

describe('getTeamsRouteDefinitions', () => {
  const definitions = getTeamsRouteDefinitions();
  const byPath = new Map(definitions.map((definition) => [definition.path, definition]));

  it('registers the three admin screens, all session-bound', () => {
    expect(definitions).toHaveLength(3);
    expect(definitions.every((definition) => definition.access === ROUTE_ACCESS.Protected)).toBe(
      true,
    );
  });

  it('gates browsing every team on the PLATFORM grant, not a team-scoped one', () => {
    // A team administrator holds team.settings.manage and still gets 403 here;
    // gating on team.browse.all is what keeps the shell honest about that.
    expect(byPath.get(APP_PATHS.adminTeams)?.meta?.permissions).toEqual([
      PERMISSIONS.teamBrowseAll,
    ]);
    expect(byPath.get(APP_PATHS.adminTeams)?.meta?.requiresTeamContext).toBe(false);
  });

  it('scopes seasons to a team and gates them on the read grant', () => {
    expect(byPath.get(APP_PATHS.adminSeasons)?.meta?.permissions).toEqual([PERMISSIONS.teamRead]);
    expect(byPath.get(APP_PATHS.adminSeasons)?.meta?.requiresTeamContext).toBe(true);
  });

  it('gates the matrix exactly as its endpoint is gated', () => {
    expect(byPath.get(APP_PATHS.adminPermissions)?.meta?.permissions).toEqual([
      PERMISSIONS.memberRolesManage,
    ]);
  });

  it('gives every screen a navigation entry in the manage group', () => {
    expect(definitions.every((definition) => definition.meta?.nav?.group === 'manage')).toBe(true);
  });
});
