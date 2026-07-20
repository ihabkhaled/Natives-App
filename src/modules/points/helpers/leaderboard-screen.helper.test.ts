import { describe, expect, it } from 'vitest';

import { ALL_CATEGORIES } from '../constants/points-filter.constants';
import { LEADERBOARD_COHORT, LEADERBOARD_PERIOD, TIE_MODE } from '../constants/points.constants';
import type { Leaderboard } from '../types/points.types';
import { buildLeaderboardChrome } from './leaderboard-screen.helper';

const t = (key: string): string => key;

const FILTERS = {
  period: LEADERBOARD_PERIOD.season,
  cohort: LEADERBOARD_COHORT.all,
  category: null,
};

const BOARD: Leaderboard = {
  rows: [
    {
      membershipId: 'm-1',
      status: 'active',
      total: 10,
      rank: 1,
      previousRank: null,
      rankDelta: null,
      movement: 'none',
      badgeCount: 0,
      contributions: [{ category: 'gym', points: 10 }],
    },
  ],
  total: 1,
  limit: 50,
  offset: 0,
  period: LEADERBOARD_PERIOD.season,
  tieMode: TIE_MODE.competition,
  cohort: LEADERBOARD_COHORT.all,
  category: null,
  asOfIso: '2026-07-13T06:00:00.000Z',
};

describe('buildLeaderboardChrome', () => {
  it('leaves the freshness and tie rule blank until the board arrives', () => {
    const chrome = buildLeaderboardChrome(t, {
      board: null,
      filters: FILTERS,
      locale: 'en',
      periodOptions: [],
      cohortOptions: [],
    });

    expect(chrome.freshnessLabel).toBe('');
    expect(chrome.tieRuleLabel).toBe('');
    expect(chrome.categoryValue).toBe(ALL_CATEGORIES);
  });

  it('states the freshness and the exact rule the server applied', () => {
    const chrome = buildLeaderboardChrome(t, {
      board: BOARD,
      filters: { ...FILTERS, category: 'gym' },
      locale: 'en',
      periodOptions: [],
      cohortOptions: [],
    });

    expect(chrome.freshnessLabel).toBe('points.freshnessLabel');
    expect(chrome.tieRuleLabel).toBe('points.tieRuleCompetition');
    expect(chrome.categoryValue).toBe('gym');
    expect(chrome.categoryOptions.map((option) => option.value)).toEqual([ALL_CATEGORIES, 'gym']);
  });
});
