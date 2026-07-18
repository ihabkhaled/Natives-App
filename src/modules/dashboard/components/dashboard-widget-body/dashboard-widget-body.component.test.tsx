import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildBreakdownWidgetView,
  buildMetricWidgetView,
  buildTasksWidgetView,
} from '../../../../../tests/factories/dashboard-view.factory';
import { DashboardWidgetBody } from './dashboard-widget-body.component';

describe('DashboardWidgetBody', () => {
  it('renders the metric body for a metric widget', () => {
    render(<DashboardWidgetBody widget={buildMetricWidgetView()} />);

    expect(screen.getByTestId(TEST_IDS.dashboardMetricValue)).toBeInTheDocument();
  });

  it('renders the breakdown table for a breakdown widget', () => {
    render(<DashboardWidgetBody widget={buildBreakdownWidgetView()} />);

    expect(screen.getByTestId(TEST_IDS.dashboardBreakdownTable)).toBeInTheDocument();
  });

  it('renders the task list for a tasks widget', () => {
    render(<DashboardWidgetBody widget={buildTasksWidgetView()} />);

    expect(screen.getAllByTestId(TEST_IDS.dashboardTaskItem).length).toBeGreaterThan(0);
  });
});
