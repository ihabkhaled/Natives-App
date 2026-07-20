import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildTrendChartView } from '../../../../../tests/factories/assessments-view.factory';
import { PerformanceTrendChart } from './performance-trend-chart.component';

describe('PerformanceTrendChart', () => {
  it('gives the drawing an accessible name that describes the series', () => {
    render(<PerformanceTrendChart chart={buildTrendChartView()} />);

    expect(screen.getByRole('img', { name: 'Speed across 2 periods.' })).toBeInTheDocument();
  });

  it('always ships a tabular alternative carrying the same numbers', () => {
    render(<PerformanceTrendChart chart={buildTrendChartView()} />);

    const table = screen.getByTestId(TEST_IDS.chartDataTable);
    expect(within(table).getByText('Spring 2026')).toBeInTheDocument();
    expect(within(table).getByText('3')).toBeInTheDocument();
  });

  it('reports an unevaluated period as not evaluated, never as zero', () => {
    render(<PerformanceTrendChart chart={buildTrendChartView()} />);

    const table = screen.getByTestId(TEST_IDS.chartDataTable);
    expect(within(table).getByText('Not evaluated')).toBeInTheDocument();
    expect(within(table).queryByText('0')).not.toBeInTheDocument();
  });

  it('explains the gaps when the series has any', () => {
    render(<PerformanceTrendChart chart={buildTrendChartView()} />);

    expect(screen.getByText('Periods without an evaluation are left blank.')).toBeInTheDocument();
  });

  it('hides the gap notice for a complete series', () => {
    render(<PerformanceTrendChart chart={buildTrendChartView({ hasGap: false })} />);

    expect(
      screen.queryByText('Periods without an evaluation are left blank.'),
    ).not.toBeInTheDocument();
  });

  it('warns when a single period cannot make a trend', () => {
    render(
      <PerformanceTrendChart
        chart={buildTrendChartView({ lowDataNotice: 'Only one published period so far.' })}
      />,
    );

    expect(screen.getByText('Only one published period so far.')).toBeInTheDocument();
  });

  it('labels the horizontal axis with each period', () => {
    render(<PerformanceTrendChart chart={buildTrendChartView()} />);

    expect(screen.getAllByText('Summer 2026').length).toBeGreaterThan(0);
  });
});
