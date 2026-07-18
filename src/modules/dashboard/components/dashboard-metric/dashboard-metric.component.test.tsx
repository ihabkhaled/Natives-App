import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildDashboardMetricView } from '../../../../../tests/factories/dashboard-view.factory';
import { DashboardMetric } from './dashboard-metric.component';

describe('DashboardMetric', () => {
  it('shows the projected value with its unit caption', () => {
    render(
      <DashboardMetric
        metric={buildDashboardMetricView({ valueText: '82', unitLabel: 'percent complete' })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.dashboardMetricValue)).toHaveTextContent('82');
    expect(screen.getByText('percent complete')).toBeInTheDocument();
  });

  it('renders a not-evaluated projection and omits the unit', () => {
    render(
      <DashboardMetric
        metric={buildDashboardMetricView({
          valueText: 'Not enough data',
          hasValue: false,
          unitLabel: null,
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.dashboardMetricValue)).toHaveTextContent('Not enough data');
    expect(screen.queryByText('percent complete')).not.toBeInTheDocument();
  });
});
