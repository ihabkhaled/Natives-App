import { describe, expect, it } from 'vitest';

import { UNPUBLISHED_BADGE_THRESHOLD } from '../constants/points.constants';
import type { LedgerEntry, PlayerBadge } from '../types/points.types';
import {
  buildBadgeCandidates,
  buildBadges,
  buildCategoryChart,
  buildLedgerEntries,
} from './ledger-view.helper';

const LOCALE = 'en';

const t = (key: string): string => key;

function entry(overrides: Partial<LedgerEntry> = {}): LedgerEntry {
  return {
    id: 'entry-1',
    entryType: 'award',
    amount: 120,
    sourceType: 'activity_submission',
    ruleVersion: 4,
    activityCategory: 'gym',
    reason: null,
    effectiveOn: '2026-07-02',
    createdAtIso: '2026-07-02T19:30:00.000Z',
    ...overrides,
  };
}

const BADGE: PlayerBadge = {
  badgeKey: 'century',
  threshold: 100,
  pointsAtAward: 120,
  awardedAtIso: '2026-07-05T19:35:00.000Z',
};

describe('buildLedgerEntries', () => {
  it('signs a positive amount explicitly and leaves a negative one alone', () => {
    const rows = buildLedgerEntries(t, 'en', [
      entry(),
      entry({ id: 'entry-2', entryType: 'reversal', amount: -20 }),
    ]);

    expect(rows[0]?.amountText).toBe('+120');
    expect(rows[1]?.amountText).toBe('-20');
    expect(rows[1]?.typeLabel).toBe('points.entryReversal');
  });

  it('says a reason was not recorded rather than showing nothing', () => {
    expect(buildLedgerEntries(t, 'en', [entry()])[0]?.reasonText).toBe('points.entryReasonEmpty');
    expect(buildLedgerEntries(t, 'en', [entry({ reason: 'Fixed' })])[0]?.reasonText).toBe('Fixed');
  });

  it('reports a missing rule version as unrecorded', () => {
    expect(buildLedgerEntries(t, 'en', [entry({ ruleVersion: null })])[0]?.ruleVersionLabel).toBe(
      'points.explainRuleVersionUnknown',
    );
    expect(buildLedgerEntries(t, 'en', [entry()])[0]?.ruleVersionLabel).toBe(
      'points.explainRuleVersion',
    );
  });
});

describe('buildBadges', () => {
  it('renders only the badges the server actually awarded', () => {
    expect(buildBadges(t, 'en', [])).toEqual([]);
    expect(buildBadges(t, 'en', [BADGE])[0]?.label).toBe('century');
  });
});

describe('buildBadgeCandidates', () => {
  it('offers the published thresholds a member has not been awarded yet', () => {
    const candidates = buildBadgeCandidates(t, 210, [BADGE]);

    expect(candidates.map((candidate) => candidate.key)).toEqual(['200', '450']);
    expect(candidates[0]?.isReached).toBe(true);
    expect(candidates[0]?.progressLabel).toBe('points.badgeCandidateReached');
    expect(candidates[1]?.progressLabel).toBe('points.badgeCandidateRemaining');
  });

  it('never offers the unresolved legacy tier', () => {
    const keys = buildBadgeCandidates(t, 10_000, []).map((candidate) => candidate.key);

    expect(keys).not.toContain(String(UNPUBLISHED_BADGE_THRESHOLD));
  });
});

describe('buildCategoryChart', () => {
  it('reports an empty chart when nothing carries a category', () => {
    const chart = buildCategoryChart(t, LOCALE, [entry({ activityCategory: null })]);

    expect(chart.bars).toEqual([]);
    expect(chart.tableRows).toEqual([]);
    expect(chart.viewBox).toMatch(/^0 0 /u);
  });

  it('sums each category and orders the bars widest first', () => {
    const chart = buildCategoryChart(t, LOCALE, [
      entry(),
      entry({ id: 'e2', activityCategory: 'throwing', amount: 90 }),
      entry({ id: 'e3', activityCategory: 'throwing', amount: -20 }),
    ]);

    expect(chart.bars.map((bar) => bar.key)).toEqual(['gym', 'throwing']);
    expect(chart.tableRows[1]?.valueText).toBe('+70');
    expect(chart.bars[0]?.width).toBeGreaterThan(chart.bars[1]?.width ?? 0);
  });

  it('always ships the same numbers in the tabular alternative', () => {
    const chart = buildCategoryChart(t, LOCALE, [entry()]);

    expect(chart.columnLabels).toHaveLength(2);
    expect(chart.tableRows).toEqual([{ key: 'gym', label: 'gym', valueText: '+120' }]);
  });
});
