import { afterEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '@/packages/http';
import { APP_ERROR_CODE, isAppError } from '@/shared/errors';

import * as gateway from '../gateways/teams.gateway';
import { createSeason } from './create-season.service';
import { createTeam } from './create-team.service';
import { getRoleMatrix } from './get-role-matrix.service';
import { listMyTeams } from './list-my-teams.service';
import { listSeasons } from './list-seasons.service';
import { listTeams } from './list-teams.service';
import { transitionSeason } from './transition-season.service';
import { transitionTeam } from './transition-team.service';
import { updateSeason } from './update-season.service';
import { updateTeam } from './update-team.service';

vi.mock('../gateways/teams.gateway');

const TEAM_DTO = {
  id: 'team-1',
  slug: 'un',
  name: 'Ultimate Natives',
  locale: 'en',
  timezone: 'Africa/Cairo',
  primaryColor: '#000000',
  logoMediaKey: null,
  status: 'active' as const,
  createdBy: 'user-1',
  updatedBy: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
  version: 3,
};

const SEASON_DTO = {
  id: 'season-1',
  teamId: 'team-1',
  slug: '2026',
  name: 'Season 2026',
  startsOn: '2026-01-01',
  endsOn: '2026-12-31',
  status: 'active' as const,
  version: 2,
};

const MATRIX_DTO = {
  policyVersion: 5,
  permissions: [{ key: 'member.list', area: 'members', description: 'List members' }],
  roles: [
    {
      key: 'TEAM_ADMIN',
      displayName: 'Team administrator',
      description: 'Runs one team',
      isSystem: true,
      permissions: ['member.list'],
    },
  ],
};

const SEASON_INPUT = {
  slug: '2027',
  name: 'Season 2027',
  startsOn: '2027-01-01',
  endsOn: '2027-12-31',
  status: 'draft' as const,
};

function envelope<T>(items: readonly T[]) {
  return { items: [...items], total: items.length, limit: 50, offset: 0 };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('teams use cases', () => {
  it('maps the platform team list to the app shape', async () => {
    vi.mocked(gateway.requestTeams).mockResolvedValue(envelope([TEAM_DTO]));

    await expect(listTeams()).resolves.toEqual([
      {
        id: 'team-1',
        slug: 'un',
        name: 'Ultimate Natives',
        locale: 'en',
        timezone: 'Africa/Cairo',
        primaryColor: '#000000',
        status: 'active',
        updatedAtIso: '2026-02-01T00:00:00.000Z',
        version: 3,
      },
    ]);
  });

  it('maps the caller own team list', async () => {
    vi.mocked(gateway.requestMyTeams).mockResolvedValue(envelope([TEAM_DTO]));

    await expect(listMyTeams()).resolves.toHaveLength(1);
  });

  it('creates and updates a team through the mapper', async () => {
    vi.mocked(gateway.requestCreateTeam).mockResolvedValue(TEAM_DTO);
    vi.mocked(gateway.requestUpdateTeam).mockResolvedValue(TEAM_DTO);

    await expect(
      createTeam({ slug: 'un', name: 'N', timezone: null, locale: null, primaryColor: null }),
    ).resolves.toMatchObject({ id: 'team-1' });
    await expect(
      updateTeam('team-1', {
        name: 'N',
        timezone: null,
        locale: null,
        primaryColor: null,
        expectedVersion: 3,
      }),
    ).resolves.toMatchObject({ version: 3 });
  });

  it('runs a team transition', async () => {
    vi.mocked(gateway.requestTeamTransition).mockResolvedValue({
      ...TEAM_DTO,
      status: 'disabled',
    });

    await expect(transitionTeam('team-1', 'deactivate', 3)).resolves.toMatchObject({
      status: 'disabled',
    });
    expect(gateway.requestTeamTransition).toHaveBeenCalledWith('team-1', 'deactivate', 3);
  });

  it('lists, creates, and updates seasons', async () => {
    vi.mocked(gateway.requestSeasons).mockResolvedValue(envelope([SEASON_DTO]));
    vi.mocked(gateway.requestCreateSeason).mockResolvedValue(SEASON_DTO);
    vi.mocked(gateway.requestUpdateSeason).mockResolvedValue(SEASON_DTO);

    await expect(listSeasons('team-1')).resolves.toEqual([
      {
        id: 'season-1',
        teamId: 'team-1',
        slug: '2026',
        name: 'Season 2026',
        startsOn: '2026-01-01',
        endsOn: '2026-12-31',
        status: 'active',
        version: 2,
      },
    ]);
    await expect(createSeason('team-1', SEASON_INPUT)).resolves.toMatchObject({ id: 'season-1' });
    await expect(
      updateSeason('team-1', 'season-1', { ...SEASON_INPUT, expectedVersion: 2 }),
    ).resolves.toMatchObject({ id: 'season-1' });
  });

  it('runs a season transition through its addressed input', async () => {
    vi.mocked(gateway.requestSeasonTransition).mockResolvedValue({
      ...SEASON_DTO,
      status: 'closed',
    });

    await expect(
      transitionSeason({
        teamId: 'team-1',
        seasonId: 'season-1',
        transition: 'close',
        expectedVersion: 2,
      }),
    ).resolves.toMatchObject({ status: 'closed' });
    expect(gateway.requestSeasonTransition).toHaveBeenCalledWith('team-1', 'season-1', 'close', 2);
  });

  it('maps the role matrix, keeping the policy version it was read at', async () => {
    vi.mocked(gateway.requestRoleMatrix).mockResolvedValue(MATRIX_DTO);

    await expect(getRoleMatrix('team-1')).resolves.toEqual({
      policyVersion: 5,
      permissions: [{ key: 'member.list', area: 'members', description: 'List members' }],
      roles: [
        {
          key: 'TEAM_ADMIN',
          displayName: 'Team administrator',
          description: 'Runs one team',
          isSystem: true,
          permissions: ['member.list'],
        },
      ],
    });
  });

  it('normalizes a transport failure into a sanitized AppError', async () => {
    vi.mocked(gateway.requestTeams).mockRejectedValue(
      new HttpError({ kind: 'forbidden', status: 403, message: 'Forbidden' }),
    );

    const error: unknown = await listTeams().catch((caught: unknown) => caught);
    expect(isAppError(error)).toBe(true);
    expect((error as { code: string }).code).toBe(APP_ERROR_CODE.Forbidden);
  });

  it('normalizes a non-HTTP failure into an unexpected AppError', async () => {
    vi.mocked(gateway.requestSeasons).mockRejectedValue(new Error('boom'));

    const error: unknown = await listSeasons('team-1').catch((caught: unknown) => caught);
    expect(isAppError(error)).toBe(true);
  });
});
