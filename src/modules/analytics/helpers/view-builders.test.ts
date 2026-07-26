import { describe, expect, it, vi } from 'vitest';

import type { RemoteQueryView } from '@/shared/view';

import type { AnalyticsSeries } from '../types/analytics.types';
import { formatComputedAt } from './freshness.helper';
import {
  mayReadPlayerSeries,
  resolvePlayerAnalyticsStatus,
  resolvePlayerName,
} from './player-analytics-view.helper';
import { buildAnalyticsControls, buildSeriesChartView } from './series-view.helper';
import {
  buildFreshnessCardView,
  buildPlayerOptions,
  buildRebuildDialogView,
  buildTeamAnalyticsPanels,
  resolveSeriesPeriods,
  resolveTeamAnalyticsStatus,
} from './team-analytics-view.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

function series(): AnalyticsSeries {
  return {
    seriesId: 's1',
    dimension: 'attendance',
    unit: 'ratio',
    direction: 'higher_better',
    periodType: 'monthly',
    calculationVersion: 'analytics-v1',
    benchmarkLabel: 'Median',
    summary: 'Up.',
    points: [
      { periodKey: '2026-01', value: 0.6, sampleSize: 18 },
      { periodKey: '2026-02', value: null, sampleSize: 3 },
    ],
    computedAtIso: '2026-07-23T06:00:00.000Z',
  };
}

describe('formatComputedAt', () => {
  it('reports the unknown label when never computed', () => {
    expect(formatComputedAt(t, 'en', null)).toBe('analytics.computedAtUnknown');
  });

  it('reports a relative time otherwise', () => {
    expect(formatComputedAt(t, 'en', '2026-07-23T06:00:00.000Z')).toContain(
      'analytics.computedAtLabel',
    );
  });
});

describe('buildAnalyticsControls', () => {
  it('includes team-only dimensions for the team screen and drops them for a player', () => {
    const team = buildAnalyticsControls(t, {
      dimension: 'attendance',
      periodType: 'monthly',
      includeTeamOnly: true,
      onDimensionChange: vi.fn(),
      onPeriodChange: vi.fn(),
    });
    const teamHealth = team.dimensionGroups.find((group) => group.key === 'teamHealth');
    expect(teamHealth?.options.some((option) => option.value === 'roster_coverage')).toBe(true);

    const player = buildAnalyticsControls(t, {
      dimension: 'overall',
      periodType: 'monthly',
      includeTeamOnly: false,
      onDimensionChange: vi.fn(),
      onPeriodChange: vi.fn(),
    });
    const playerHealth = player.dimensionGroups.find((group) => group.key === 'teamHealth');
    expect(playerHealth?.options.some((option) => option.value === 'roster_coverage')).toBe(false);
    team.onDimensionChange('overall');
    team.onPeriodChange('season');
  });
});

describe('buildSeriesChartView', () => {
  it('surfaces the gap notice and carries the server summary', () => {
    const view = buildSeriesChartView(t, 'en', series());
    expect(view.gapNotice).not.toBeNull();
    expect(view.summary).toBe('Up.');
    expect(view.tableRows).toHaveLength(2);
    expect(view.tableRows[1]?.valueText).toContain('analytics.chartValueMissing');
  });

  it('omits the gap notice for a fully-evaluated series', () => {
    const noGap = { ...series(), points: [{ periodKey: '2026-01', value: 0.6, sampleSize: 18 }] };
    expect(buildSeriesChartView(t, 'en', noGap).gapNotice).toBeNull();
  });
});

describe('team-analytics view builders', () => {
  it('resolves period keys and the active cohort key', () => {
    const periods = resolveSeriesPeriods(series(), '');
    expect(periods.activeCohortKey).toBe('2026-02');
    expect(resolveSeriesPeriods(null, '2026-03').activeCohortKey).toBe('2026-03');
  });

  it('builds player options from members', () => {
    expect(buildPlayerOptions([{ membershipId: 'm', displayName: 'Omar' }])).toEqual([
      { value: 'm', label: 'Omar' },
    ]);
    expect(buildPlayerOptions(undefined)).toEqual([]);
  });

  it('builds panels and a freshness card for a rebuild holder', () => {
    const panels = buildTeamAnalyticsPanels(t, 'en', {
      series: series(),
      locale: 'en',
      cohort: null,
      periodKeys: ['2026-01'],
      activeCohortKey: '2026-01',
      onCohortPeriodChange: vi.fn(),
      freshness: {
        series: series(),
        statusLabel: 'fresh',
        isStale: true,
        canRebuild: true,
        isOffline: false,
        reportBanner: null,
        dialog: null,
        onOpenRebuild: vi.fn(),
      },
    });
    expect(panels.chart).not.toBeNull();
    expect(panels.cohort?.emptyLabel).not.toBeNull();
    expect(panels.freshness?.rebuildLabel).not.toBeNull();
    expect(panels.freshness?.staleBadgeLabel).not.toBeNull();
  });

  it('hides the stale badge and rebuild affordance when fresh and ungranted', () => {
    const card = buildFreshnessCardView(t, {
      series: series(),
      statusLabel: 'fresh',
      isStale: false,
      canRebuild: false,
      isOffline: false,
      reportBanner: null,
      dialog: null,
      onOpenRebuild: vi.fn(),
    });
    expect(card?.staleBadgeLabel).toBeNull();
    expect(card?.rebuildLabel).toBeNull();
    expect(card?.rebuildDisabledReason).toBeNull();
  });

  it('disables rebuild with the offline reason when granted but offline', () => {
    const card = buildFreshnessCardView(t, {
      series: series(),
      statusLabel: 'stale',
      isStale: true,
      canRebuild: true,
      isOffline: true,
      reportBanner: null,
      dialog: null,
      onOpenRebuild: vi.fn(),
    });
    expect(card?.rebuildDisabledReason).toBe('analytics.offlineMessage');
    expect(card?.rebuildLabel).not.toBeNull();
  });

  it('builds the rebuild dialog and resolves the team status', () => {
    const dialog = buildRebuildDialogView(t, {
      periodValue: 'monthly',
      isOffline: false,
      isRunning: false,
      onPeriodChange: vi.fn(),
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
    });
    expect(dialog.periodOptions.length).toBe(3);
    expect(dialog.canConfirm).toBe(true);
    const query = { data: series(), isLoading: false, error: null, refetch: () => undefined };
    expect(resolveTeamAnalyticsStatus({ isOffline: false, isLoading: false }, query, true)).toBe(
      'ready',
    );
  });

  it('returns a null chart/cohort and no freshness for an absent series', () => {
    const panels = buildTeamAnalyticsPanels(t, 'en', {
      series: null,
      locale: 'en',
      cohort: null,
      periodKeys: [],
      activeCohortKey: '',
      onCohortPeriodChange: vi.fn(),
      freshness: {
        series: null,
        statusLabel: '',
        isStale: false,
        canRebuild: false,
        isOffline: true,
        reportBanner: null,
        dialog: null,
        onOpenRebuild: vi.fn(),
      },
    });
    expect(panels.chart).toBeNull();
    expect(panels.cohort).toBeNull();
    expect(panels.freshness).toBeNull();
    expect(
      buildFreshnessCardView(t, {
        series: null,
        statusLabel: '',
        isStale: false,
        canRebuild: false,
        isOffline: false,
        reportBanner: null,
        dialog: null,
        onOpenRebuild: vi.fn(),
      }),
    ).toBeNull();
  });
});

describe('player-analytics view helpers', () => {
  const query: RemoteQueryView<AnalyticsSeries> = {
    data: undefined,
    isLoading: false,
    error: null,
    refetch: () => undefined,
  };

  it('applies the dual-gate read rule', () => {
    expect(mayReadPlayerSeries('m1', 'm1', false, true)).toBe(true);
    expect(mayReadPlayerSeries('m1', 'm2', false, true)).toBe(false);
    expect(mayReadPlayerSeries('m1', 'm2', true, false)).toBe(true);
    expect(mayReadPlayerSeries('', '', false, true)).toBe(false);
  });

  it('resolves the player name with a fallback to the id', () => {
    expect(
      resolvePlayerName(
        [
          {
            membershipId: 'm',
            displayName: 'Omar',
            teamId: 't',
            status: 'active',
            nickname: null,
            jerseyNumber: null,
            positions: [],
            hasAvatar: false,
          },
        ],
        'm',
      ),
    ).toBe('Omar');
    expect(resolvePlayerName(undefined, 'ghost')).toBe('ghost');
  });

  it('treats a missing scope as a data-present, non-error state', () => {
    expect(
      resolvePlayerAnalyticsStatus({
        isLoading: false,
        mayRead: true,
        isOffline: false,
        isScopeMissing: true,
        query,
      }),
    ).toBe('empty');
    expect(
      resolvePlayerAnalyticsStatus({
        isLoading: false,
        mayRead: false,
        isOffline: false,
        isScopeMissing: false,
        query,
      }),
    ).toBe('forbidden');
  });
});
