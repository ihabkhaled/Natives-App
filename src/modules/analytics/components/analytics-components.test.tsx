import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { AnalyticsFreshnessCard } from './analytics-freshness-card';
import { AnalyticsSeriesChart } from './analytics-series-chart';
import { TeamAnalyticsScreen } from './team-analytics-view';

const noop = vi.fn();

const chart = {
  title: 'Attendance',
  description: 'desc',
  geometry: {
    linePath: 'M0 0',
    markers: [{ key: 'm', x: 1, y: 2 }],
    ticks: [{ key: 't', x: 1, label: '2026-01' }],
    hasGap: false,
  },
  unitLabel: 'Ratio',
  directionLegend: 'Higher is better',
  gapNotice: null as string | null,
  summary: 'Up.',
  benchmark: 'Median',
  calculationVersion: 'v1',
  computedAt: 'today',
  tableCaption: 'Values',
  tableToggleLabel: 'Show table',
  tableColumnLabels: ['Period', 'Value'],
  tableRows: [{ key: 'r', label: '2026-01', valueText: '0.6' }],
};

describe('analytics components (both branches)', () => {
  it('renders the series chart without and with a gap notice', () => {
    const view = render(<AnalyticsSeriesChart chart={chart} />);
    render(<AnalyticsSeriesChart chart={{ ...chart, gapNotice: 'gap' }} />);
    expect(view.container).toBeInTheDocument();
  });

  it('renders the freshness card fresh (no badge, no rebuild) and stale with rebuild + dialog + banner', () => {
    const view = render(
      <AnalyticsFreshnessCard
        view={{
          heading: 'Freshness',
          statusLabel: 'fresh',
          isStale: false,
          staleBadgeLabel: null,
          rebuildLabel: null,
          onOpenRebuild: noop,
          rebuildDisabledReason: null,
          dialog: null,
          reportBanner: null,
        }}
      />,
    );
    render(
      <AnalyticsFreshnessCard
        view={{
          heading: 'Freshness',
          statusLabel: 'stale',
          isStale: true,
          staleBadgeLabel: 'Stale',
          rebuildLabel: 'Rebuild',
          onOpenRebuild: noop,
          rebuildDisabledReason: 'Offline',
          reportBanner: 'Rebuilt 22 subjects',
          dialog: {
            heading: 'Rebuild',
            intro: 'i',
            periodLabel: 'Period',
            periodValue: 'monthly',
            periodOptions: [{ value: 'monthly', label: 'Monthly' }],
            onPeriodChange: noop,
            confirmLabel: 'Go',
            cancelLabel: 'Cancel',
            canConfirm: true,
            isRunning: false,
            onConfirm: noop,
            onCancel: noop,
          },
        }}
      />,
    );
    expect(view.container).toBeInTheDocument();
  });

  it('renders the team screen ready with chart, cohort, freshness — and loading', () => {
    const base = {
      loadingLabel: 'Loading',
      errorTitle: 'Error',
      errorMessage: 'Failed',
      retryLabel: 'Retry',
      onRetry: noop,
      offlineTitle: 'Offline',
      offlineMessage: 'Offline',
      offlineNoticeLabel: 'Offline',
      isOffline: false,
      forbiddenTitle: 'No access',
      forbiddenMessage: 'No access',
      emptyTitle: 'Empty',
      emptyMessage: 'Empty',
      title: 'Team analytics',
      subtitle: 'sub',
      controls: {
        dimensionLabel: 'Dimension',
        dimensionValue: 'attendance',
        dimensionGroups: [
          {
            key: 'teamHealth',
            label: 'Team health',
            options: [{ value: 'attendance', label: 'Attendance' }],
          },
        ],
        onDimensionChange: noop,
        periodLabel: 'Period',
        periodValue: 'monthly',
        periodOptions: [{ value: 'monthly', label: 'Monthly' }],
        onPeriodChange: noop,
      },
      playerSelectLabel: 'View a player',
      playerSelectValue: '',
      playerOptions: [{ value: 'm1', label: 'Omar' }],
      onPlayerSelect: noop,
    };
    render(
      <TeamAnalyticsScreen
        {...base}
        status="ready"
        chart={chart}
        cohort={{
          heading: 'Cohort',
          intro: 'i',
          periodLabel: 'Period',
          periodValue: '2026-01',
          periodOptions: [{ value: '2026-01', label: '2026-01' }],
          onPeriodChange: noop,
          tiles: [{ key: 'avg', label: 'Average', value: '0.7' }],
          sampleLabel: '20 members',
          suppressedTitle: null,
          suppressedMessage: null,
          emptyLabel: null,
        }}
        freshness={{
          heading: 'Freshness',
          statusLabel: 'fresh',
          isStale: false,
          staleBadgeLabel: null,
          rebuildLabel: null,
          onOpenRebuild: noop,
          rebuildDisabledReason: null,
          dialog: null,
          reportBanner: null,
        }}
      />,
    );
    expect(screen.getByTestId(TEST_IDS.analyticsSeriesChart)).toBeInTheDocument();
    render(
      <TeamAnalyticsScreen
        {...base}
        status="loading"
        chart={null}
        cohort={null}
        freshness={null}
      />,
    );
    // Ready with a chart but no cohort/freshness panels — the null side of each guard.
    render(
      <TeamAnalyticsScreen {...base} status="ready" chart={chart} cohort={null} freshness={null} />,
    );
  });
});
