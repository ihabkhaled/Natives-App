import { describe, expect, it } from 'vitest';

import { ALL_CATEGORIES } from '../constants/points-filter.constants';
import { LEADERBOARD_COHORTS, LEADERBOARD_PERIODS, TIE_MODE } from '../constants/points.constants';
import type { LeaderboardRow } from '../types/points.types';
import {
  buildCategoryOptions,
  buildCohortOptions,
  buildLeaderboardRows,
  buildPeriodOptions,
  buildTieRuleLabel,
} from './leaderboard-view.helper';

const LOCALE = 'en';

const t = (key: string): string => key;

function row(overrides: Partial<LeaderboardRow> = {}): LeaderboardRow {
  return {
    membershipId: 'm-1',
    status: 'active',
    total: 210,
    rank: 1,
    previousRank: 3,
    rankDelta: 2,
    movement: 'up',
    badgeCount: 2,
    contributions: [{ category: 'gym', points: 210 }],
    ...overrides,
  };
}

describe('filter options', () => {
  it('offers every canonical period and cohort', () => {
    expect(buildPeriodOptions(t)).toHaveLength(LEADERBOARD_PERIODS.length);
    expect(buildCohortOptions(t)).toHaveLength(LEADERBOARD_COHORTS.length);
  });

  it('derives the category list from the contributions the server sent', () => {
    const options = buildCategoryOptions(t, [
      row(),
      row({ membershipId: 'm-2', contributions: [{ category: 'running', points: 10 }] }),
    ]);

    expect(options[0]?.value).toBe(ALL_CATEGORIES);
    expect(options.map((option) => option.value)).toEqual([ALL_CATEGORIES, 'gym', 'running']);
  });

  it('states each tie-break rule in plain words', () => {
    expect(buildTieRuleLabel(t, TIE_MODE.competition)).toBe('points.tieRuleCompetition');
    expect(buildTieRuleLabel(t, TIE_MODE.dense)).toBe('points.tieRuleDense');
    expect(buildTieRuleLabel(t, TIE_MODE.ordinal)).toBe('points.tieRuleOrdinal');
  });
});

describe('buildLeaderboardRows', () => {
  it('keeps a zero-total member on the board and marks the row', () => {
    const rows = buildLeaderboardRows(t, LOCALE, {
      rows: [row(), row({ membershipId: 'm-9', total: 0, rank: 2, badgeCount: 0 })],
      expandedId: '',
      ruleVersion: null,
    });

    expect(rows).toHaveLength(2);
    expect(rows[1]?.isZero).toBe(true);
    expect(rows[1]?.badgeCountLabel).toBeNull();
  });

  it('labels rows that share a server rank as tied', () => {
    const rows = buildLeaderboardRows(t, LOCALE, {
      rows: [row({ rank: 2 }), row({ membershipId: 'm-2', rank: 2 }), row({ rank: 4 })],
      expandedId: '',
      ruleVersion: null,
    });

    expect(rows[0]?.isTied).toBe(true);
    expect(rows[2]?.isTied).toBe(false);
    expect(rows[2]?.tiedLabel).toBeNull();
  });

  it('describes movement without relying on colour', () => {
    const rows = buildLeaderboardRows(t, LOCALE, {
      rows: [
        row(),
        row({ membershipId: 'm-2', movement: 'steady', rankDelta: 0 }),
        row({ membershipId: 'm-3', movement: 'none', previousRank: null, rankDelta: null }),
        row({ membershipId: 'm-4', movement: 'down', previousRank: 1, rankDelta: null }),
      ],
      expandedId: '',
      ruleVersion: null,
    });

    expect(rows[0]?.movementDetail).toBe('points.movementDelta');
    expect(rows[1]?.movementDetail).toBe('points.previousRank');
    expect(rows[2]?.movementDetail).toBe('points.previousRankUnknown');
    expect(rows[3]?.movementDetail).toBe('points.previousRank');
    expect(rows[0]?.movementGlyph).not.toBe('');
  });

  it('expands exactly the requested row and reports the rule version', () => {
    const rows = buildLeaderboardRows(t, LOCALE, {
      rows: [row(), row({ membershipId: 'm-2', contributions: [] })],
      expandedId: 'm-2',
      ruleVersion: 4,
    });

    expect(rows[0]?.isExpanded).toBe(false);
    expect(rows[1]?.isExpanded).toBe(true);
    expect(rows[1]?.explanation.rows).toEqual([]);
    expect(rows[1]?.explanation.ruleVersionLabel).toBe('points.explainRuleVersion');
  });

  it('says so when the server recorded no rule version', () => {
    const rows = buildLeaderboardRows(t, LOCALE, {
      rows: [row()],
      expandedId: '',
      ruleVersion: null,
    });

    expect(rows[0]?.explanation.ruleVersionLabel).toBe('points.explainRuleVersionUnknown');
    expect(rows[0]?.explanation.totalText).toBe('210');
  });
});
