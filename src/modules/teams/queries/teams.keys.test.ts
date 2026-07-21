import { describe, expect, it, vi } from 'vitest';

import {
  buildRoleMatrixQueryOptions,
  buildSeasonsQueryOptions,
  buildTeamsQueryOptions,
} from './teams.query';
import { teamsQueryKeys } from './teams.keys';

vi.mock('../services/list-teams.service', () => ({ listTeams: vi.fn() }));
vi.mock('../services/list-seasons.service', () => ({ listSeasons: vi.fn() }));
vi.mock('../services/get-role-matrix.service', () => ({ getRoleMatrix: vi.fn() }));

describe('teamsQueryKeys', () => {
  it('namespaces every branch under one root', () => {
    expect(teamsQueryKeys.all).toEqual(['teams']);
    expect(teamsQueryKeys.list()).toEqual(['teams', 'list']);
    expect(teamsQueryKeys.seasons('team-1')).toEqual(['teams', 'seasons', 'team-1']);
    expect(teamsQueryKeys.roleMatrix('team-1')).toEqual(['teams', 'role-matrix', 'team-1']);
  });

  it('keys the season and matrix caches on the team, so a switch re-keys them', () => {
    expect(teamsQueryKeys.seasons('team-1')).not.toEqual(teamsQueryKeys.seasons('team-2'));
    expect(teamsQueryKeys.roleMatrix('team-1')).not.toEqual(teamsQueryKeys.roleMatrix('team-2'));
  });
});

describe('teams query options', () => {
  it('never issues the platform browse without its grant', () => {
    expect(buildTeamsQueryOptions(false).enabled).toBe(false);
    expect(buildTeamsQueryOptions(true).enabled).toBe(true);
  });

  it('waits for a resolved team before asking for its seasons', () => {
    expect(buildSeasonsQueryOptions('', true).enabled).toBe(false);
    expect(buildSeasonsQueryOptions('team-1', false).enabled).toBe(false);
    expect(buildSeasonsQueryOptions('team-1', true).enabled).toBe(true);
  });

  it('gates the role matrix on its own grant', () => {
    expect(buildRoleMatrixQueryOptions('team-1', false).enabled).toBe(false);
    expect(buildRoleMatrixQueryOptions('team-1', true).enabled).toBe(true);
  });

  it('wires each query to its own key and fetcher', async () => {
    expect(buildTeamsQueryOptions(true).queryKey).toEqual(teamsQueryKeys.list());
    await buildTeamsQueryOptions(true).queryFn();
    await buildSeasonsQueryOptions('team-1', true).queryFn();
    await buildRoleMatrixQueryOptions('team-1', true).queryFn();

    const { listTeams } = await import('../services/list-teams.service');
    const { listSeasons } = await import('../services/list-seasons.service');
    const { getRoleMatrix } = await import('../services/get-role-matrix.service');
    expect(listTeams).toHaveBeenCalledTimes(1);
    expect(listSeasons).toHaveBeenCalledWith('team-1');
    expect(getRoleMatrix).toHaveBeenCalledWith('team-1');
  });
});
