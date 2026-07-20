import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { ChartDataTable } from './chart-data-table.component';

const ROWS = [
  { key: 'a', label: 'Spring 2026', valueText: '3' },
  { key: 'b', label: 'Summer 2026', valueText: 'Not evaluated' },
];

describe('ChartDataTable', () => {
  it('renders a real table with a caption and column headers', () => {
    render(
      <ChartDataTable
        caption="Data behind Trend"
        toggleLabel="Show the data table"
        columnLabels={['Period', 'Value']}
        rows={ROWS}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.chartDataTable)).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Period' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Value' })).toBeInTheDocument();
    expect(screen.getByText('Data behind Trend')).toBeInTheDocument();
  });

  it('exposes each row as a header cell plus its value', () => {
    render(
      <ChartDataTable
        caption="Data behind Trend"
        toggleLabel="Show the data table"
        columnLabels={['Period', 'Value']}
        rows={ROWS}
      />,
    );

    expect(screen.getByRole('rowheader', { name: 'Spring 2026' })).toBeInTheDocument();
    expect(screen.getByText('Not evaluated')).toBeInTheDocument();
  });

  it('uses a native disclosure so the table stays keyboard reachable', () => {
    render(
      <ChartDataTable
        caption="Data behind Trend"
        toggleLabel="Show the data table"
        columnLabels={['Period', 'Value']}
        rows={ROWS}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.chartDataToggle)).toHaveTextContent('Show the data table');
  });
});
