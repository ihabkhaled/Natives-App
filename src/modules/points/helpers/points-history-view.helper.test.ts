import { describe, expect, it } from 'vitest';

import type { PointsSummary } from '../types/points.types';
import { buildPointsHistoryBody } from './points-history-view.helper';

const t = (key: string): string => key;

const SUMMARY: PointsSummary = {
  membershipId: 'm-1',
  total: 210,
  entries: [
    {
      id: 'e1',
      entryType: 'award',
      amount: 210,
      sourceType: 'activity_submission',
      ruleVersion: 4,
      activityCategory: 'gym',
      reason: null,
      effectiveOn: '2026-07-02',
      createdAtIso: '2026-07-02T19:30:00.000Z',
    },
  ],
  badges: [],
};

describe('buildPointsHistoryBody', () => {
  it('renders an empty ledger without inventing a total', () => {
    const body = buildPointsHistoryBody(t, 'en', null);

    expect(body.totalText).toBe('0');
    expect(body.entries).toEqual([]);
    expect(body.hasEntries).toBe(false);
    expect(body.badges).toEqual([]);
  });

  it('carries the server total and the ledger through', () => {
    const body = buildPointsHistoryBody(t, 'en', SUMMARY);

    expect(body.totalText).toBe('210');
    expect(body.hasEntries).toBe(true);
    expect(body.chart.bars).toHaveLength(1);
    expect(body.candidates).toHaveLength(3);
  });
});
