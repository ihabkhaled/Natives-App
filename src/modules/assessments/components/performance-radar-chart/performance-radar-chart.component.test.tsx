import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildRadarChartView } from '../../../../../tests/factories/assessments-view.factory';
import { PerformanceRadarChart } from './performance-radar-chart.component';

describe('PerformanceRadarChart', () => {
  it('describes the radar for assistive technology', () => {
    render(<PerformanceRadarChart chart={buildRadarChartView()} />);

    expect(
      screen.getByRole('img', { name: 'Latest published profile across 2 categories.' }),
    ).toBeInTheDocument();
  });

  it('offers the text alternative a radar always needs', () => {
    render(<PerformanceRadarChart chart={buildRadarChartView()} />);

    const table = screen.getByTestId(TEST_IDS.chartDataTable);
    expect(within(table).getByText('Athletic')).toBeInTheDocument();
    expect(within(table).getByText('4')).toBeInTheDocument();
    expect(within(table).getByText('Not evaluated')).toBeInTheDocument();
  });

  it('lists every axis as a readable legend', () => {
    render(<PerformanceRadarChart chart={buildRadarChartView()} />);

    expect(screen.getAllByText('Mental').length).toBeGreaterThan(0);
  });

  it('captions the table so the alternative is self-describing', () => {
    render(<PerformanceRadarChart chart={buildRadarChartView()} />);

    expect(screen.getByText('Data behind Category profile')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Metric' })).toBeInTheDocument();
  });
});
