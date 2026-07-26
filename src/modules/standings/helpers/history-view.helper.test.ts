import { describe, expect, it, vi } from 'vitest';

import type { RemoteQueryView } from '@/shared/view';

import type { TeamHistoryEntry, TeamHistoryPage } from '../types/achievements.types';
import {
  buildHistoryCategoryOptions,
  buildHistoryResolvers,
  buildHistorySeasons,
  buildTeamHistoryScreenView,
} from './history-view.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

function entry(overrides: Partial<TeamHistoryEntry>): TeamHistoryEntry {
  return {
    achievementId: 'a1',
    seasonId: 's1',
    competitionId: null,
    membershipId: null,
    category: 'trophy',
    title: 'Champions',
    achievedOn: '2026-06-20',
    ...overrides,
  };
}

const resolvers = buildHistoryResolvers(
  [
    {
      id: 's1',
      teamId: 'team',
      slug: '2026',
      name: 'Season 2026',
      startsOn: '2026-01-01',
      endsOn: '2026-12-31',
      status: 'active',
      version: 1,
    },
  ],
  [
    {
      membershipId: 'm1',
      teamId: 'team',
      status: 'active',
      displayName: 'Omar',
      nickname: null,
      jerseyNumber: null,
      positions: [],
      hasAvatar: false,
    },
  ],
);

describe('buildHistoryResolvers', () => {
  it('resolves a known season and member', () => {
    expect(resolvers.seasonName('s1')).toBe('Season 2026');
    expect(resolvers.memberName('m1')).toBe('Omar');
  });

  it('returns null for unknown ids and undefined directories', () => {
    expect(resolvers.seasonName('gone')).toBeNull();
    expect(resolvers.memberName('gone')).toBeNull();
    const empty = buildHistoryResolvers(undefined, undefined);
    expect(empty.seasonName('s1')).toBeNull();
    expect(empty.memberName('m1')).toBeNull();
  });
});

describe('buildHistorySeasons', () => {
  it('groups entries into seasons in first-encounter order', () => {
    const seasons = buildHistorySeasons(
      t,
      'en',
      [
        entry({ achievementId: 'a1', seasonId: 's1' }),
        entry({ achievementId: 'a2', seasonId: 's1' }),
      ],
      resolvers,
    );
    expect(seasons).toHaveLength(1);
    expect(seasons[0]?.heading).toBe('Season 2026');
    expect(seasons[0]?.entries).toHaveLength(2);
  });

  it('collects null-season entries under "Earlier"', () => {
    const seasons = buildHistorySeasons(t, 'en', [entry({ seasonId: null })], resolvers);
    expect(seasons[0]?.heading).toBe('standings.historyEarlierSeason');
  });

  it('resolves the member chip for a player achievement', () => {
    const seasons = buildHistorySeasons(t, 'en', [entry({ membershipId: 'm1' })], resolvers);
    expect(seasons[0]?.entries[0]?.memberName).toBe('Omar');
  });

  it('renders the title alone when the member id cannot be resolved', () => {
    const seasons = buildHistorySeasons(t, 'en', [entry({ membershipId: 'ghost' })], resolvers);
    expect(seasons[0]?.entries[0]?.memberName).toBeNull();
  });
});

describe('buildTeamHistoryScreenView', () => {
  const page: RemoteQueryView<TeamHistoryPage> = {
    data: { items: [], total: 40, limit: 20, offset: 0 },
    isLoading: false,
    error: null,
    refetch: () => undefined,
  };

  it('offers load-more and the manage link for a manager with more pages', () => {
    const view = buildTeamHistoryScreenView(t, {
      context: { isOffline: false, isLoading: false, canReadHistory: true, canManage: true },
      pageQuery: page,
      locale: 'en',
      entries: [entry({})],
      total: 40,
      hasMore: true,
      categoryValue: 'all',
      resolvers,
      onCategoryChange: vi.fn(),
      onLoadMore: vi.fn(),
      onOpenManage: vi.fn(),
    });
    expect(view.loadMoreLabel).not.toBeNull();
    expect(view.manageLink).not.toBeNull();
    expect(buildHistoryCategoryOptions(t)[0]?.value).toBe('all');
  });

  it('hides load-more and the manage link for a member on the last page', () => {
    const view = buildTeamHistoryScreenView(t, {
      context: { isOffline: false, isLoading: false, canReadHistory: true, canManage: false },
      pageQuery: page,
      locale: 'en',
      entries: [entry({})],
      total: 1,
      hasMore: false,
      categoryValue: 'all',
      resolvers,
      onCategoryChange: vi.fn(),
      onLoadMore: vi.fn(),
      onOpenManage: vi.fn(),
    });
    expect(view.loadMoreLabel).toBeNull();
    expect(view.manageLink).toBeNull();
  });
});
