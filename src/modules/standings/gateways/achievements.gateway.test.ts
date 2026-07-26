import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import {
  requestAchievement,
  requestAchievements,
  requestCreateAchievement,
  requestImportAchievements,
  requestTeamHistory,
  requestTransitionAchievement,
} from './achievements.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const get = vi.fn();
const post = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  get.mockResolvedValue({});
  post.mockResolvedValue({});
  vi.mocked(getAppHttpClient).mockReturnValue({ get, post } as never);
});

describe('achievements.gateway', () => {
  it('reads a filtered achievements page', async () => {
    await requestAchievements('t1', { status: 'submitted', category: 'trophy' }, 20);
    const [path, , options] = get.mock.calls[0] as [
      string,
      unknown,
      { params: Record<string, unknown> },
    ];
    expect(path).toBe('/teams/t1/achievements');
    expect(options.params).toMatchObject({ status: 'submitted', category: 'trophy', offset: 20 });
  });

  it('omits unset facets', async () => {
    await requestAchievements('t1', { status: null, category: null }, 0);
    const [, , options] = get.mock.calls[0] as [
      string,
      unknown,
      { params: Record<string, unknown> },
    ];
    expect(options.params).not.toHaveProperty('status');
    expect(options.params).not.toHaveProperty('category');
  });

  it('reads one claim and posts its transition, create, and import', async () => {
    await requestAchievement('t1', 'a1');
    expect(get.mock.calls[0]?.[0]).toBe('/teams/t1/achievements/a1');

    await requestTransitionAchievement('t1', 'a1', {
      transition: 'approve',
      expectedRecordVersion: 1,
      reason: null,
    });
    expect(post.mock.calls[0]?.[0]).toBe('/teams/t1/achievements/a1/transition');

    await requestCreateAchievement('t1', {
      category: 'trophy',
      title: 'X',
      description: null,
      achievedOn: '2026-01-01',
      membershipId: null,
      evidenceReference: null,
      visibility: 'team',
    });
    expect(post.mock.calls[1]?.[0]).toBe('/teams/t1/achievements');

    await requestImportAchievements('t1', { dryRun: true, rows: [] });
    expect(post.mock.calls[2]?.[0]).toBe('/teams/t1/achievements/import');
  });

  it('reads the trophy cabinet with its category facet', async () => {
    await requestTeamHistory('t1', { category: 'trophy' }, 0);
    const [path, , options] = get.mock.calls[0] as [
      string,
      unknown,
      { params: Record<string, unknown> },
    ];
    expect(path).toBe('/teams/t1/history');
    expect(options.params).toMatchObject({ category: 'trophy' });
  });
});
