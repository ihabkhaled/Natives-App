import { afterEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import {
  requestCreateSeason,
  requestCreateTeam,
  requestCurrentSeason,
  requestMyTeams,
  requestRoleMatrix,
  requestSeasonTransition,
  requestSeasons,
  requestTeamTransition,
  requestTeams,
  requestUpdateSeason,
  requestUpdateTeam,
} from './teams.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const get = vi.fn().mockResolvedValue({});
const post = vi.fn().mockResolvedValue({});
const patch = vi.fn().mockResolvedValue({});

function client(): void {
  vi.mocked(getAppHttpClient).mockReturnValue({ get, post, patch } as never);
}

client();

afterEach(() => {
  vi.clearAllMocks();
  client();
});

const SEASON = {
  slug: '2027',
  name: 'Season 2027',
  startsOn: '2027-01-01',
  endsOn: '2027-12-31',
  status: 'draft' as const,
};

describe('teams.gateway', () => {
  it('lists the platform team collection with bounded paging', async () => {
    await requestTeams();
    const [path, , options] = get.mock.calls[0] as [string, unknown, { params: object }];
    expect(path).toBe('/teams');
    expect(options.params).toEqual({ limit: 50, offset: 0 });
  });

  it('lists the caller own teams from the team-scoped route', async () => {
    await requestMyTeams();
    expect(get.mock.calls[0]?.[0]).toBe('/teams/mine');
  });

  it('creates a team and omits the optional fields that were left blank', async () => {
    await requestCreateTeam({
      slug: 'natives-b',
      name: 'Natives B',
      timezone: null,
      locale: null,
      primaryColor: null,
    });
    const [path, body] = post.mock.calls[0] as [string, Record<string, unknown>];
    expect(path).toBe('/teams');
    expect(body).toEqual({ slug: 'natives-b', name: 'Natives B' });
  });

  it('sends the optional team fields that were provided', async () => {
    await requestCreateTeam({
      slug: 'natives-b',
      name: 'Natives B',
      timezone: 'Africa/Cairo',
      locale: 'ar',
      primaryColor: '#000000',
    });
    expect(post.mock.calls[0]?.[1]).toEqual({
      slug: 'natives-b',
      name: 'Natives B',
      timezone: 'Africa/Cairo',
      locale: 'ar',
      primaryColor: '#000000',
    });
  });

  it('updates a team with its optimistic-concurrency token', async () => {
    await requestUpdateTeam('team/1', {
      name: 'Renamed',
      timezone: null,
      locale: null,
      primaryColor: null,
      expectedVersion: 3,
    });
    const [path, body] = patch.mock.calls[0] as [string, Record<string, unknown>];
    expect(path).toBe('/teams/team%2F1');
    expect(body).toEqual({ name: 'Renamed', expectedVersion: 3 });
  });

  it('runs a team lifecycle transition as its own verb', async () => {
    await requestTeamTransition('team-1', 'deactivate', 2);
    const [path, body] = post.mock.calls[0] as [string, Record<string, unknown>];
    expect(path).toBe('/teams/team-1/deactivate');
    expect(body).toEqual({ expectedVersion: 2 });
  });

  it('lists and creates seasons under the owning team', async () => {
    await requestSeasons('team-1');
    expect(get.mock.calls[0]?.[0]).toBe('/teams/team-1/seasons');

    await requestCreateSeason('team-1', SEASON);
    const [path, body] = post.mock.calls[0] as [string, Record<string, unknown>];
    expect(path).toBe('/teams/team-1/seasons');
    expect(body).toEqual(SEASON);
  });

  it('updates a season with its version and lifecycle status', async () => {
    await requestUpdateSeason('team-1', 'season/1', { ...SEASON, expectedVersion: 4 });
    const [path, body] = patch.mock.calls[0] as [string, Record<string, unknown>];
    expect(path).toBe('/teams/team-1/seasons/season%2F1');
    expect(body).toEqual({ ...SEASON, expectedVersion: 4 });
  });

  it('runs a season lifecycle transition as its own verb', async () => {
    await requestSeasonTransition('team-1', 'season-1', 'close', 1);
    const [path, body] = post.mock.calls[0] as [string, Record<string, unknown>];
    expect(path).toBe('/teams/team-1/seasons/season-1/close');
    expect(body).toEqual({ expectedVersion: 1 });
  });

  it('asks for the season covering today', async () => {
    await requestCurrentSeason('team-1');
    expect(get.mock.calls[0]?.[0]).toBe('/teams/team-1/seasons/current');
  });

  it('scopes the role matrix so a team-scoped grant satisfies it', async () => {
    await requestRoleMatrix('team-1');
    const [path, , options] = get.mock.calls[0] as [string, unknown, { params?: object }];
    expect(path).toBe('/rbac/role-bundles');
    expect(options.params).toEqual({ teamId: 'team-1' });
  });

  it('omits the scope entirely when there is no active team', async () => {
    await requestRoleMatrix('');
    const [, , options] = get.mock.calls[0] as [string, unknown, { params?: object }];
    expect(options.params).toBeUndefined();
  });
});
