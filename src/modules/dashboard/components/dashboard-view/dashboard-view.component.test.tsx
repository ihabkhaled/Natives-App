import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildDashboardView,
  buildTasksWidgetView,
} from '../../../../../tests/factories/dashboard-view.factory';
import { DashboardView } from './dashboard-view.component';

describe('DashboardView', () => {
  it('renders the persona headline and freshness label', () => {
    render(
      <DashboardView
        {...buildDashboardView({ title: 'Coach dashboard', updatedLabel: 'Updated today' })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.dashboardView)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Coach dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Updated today')).toBeInTheDocument();
  });

  it('renders a stable loading skeleton', () => {
    render(<DashboardView {...buildDashboardView({ status: 'loading' })} />);

    expect(screen.getByTestId(TEST_IDS.dashboardLoading)).toBeInTheDocument();
  });

  it('renders the error state with sanitized copy', () => {
    render(
      <DashboardView
        {...buildDashboardView({ status: 'error', errorMessage: 'Please try again.' })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.dashboardError)).toHaveTextContent('Please try again.');
  });

  it('renders the offline state when disconnected with no data', () => {
    render(<DashboardView {...buildDashboardView({ status: 'offline' })} />);

    expect(screen.getByTestId(TEST_IDS.dashboardOffline)).toBeInTheDocument();
  });

  it('renders the empty state when no widgets are visible', () => {
    render(<DashboardView {...buildDashboardView({ status: 'empty' })} />);

    expect(screen.getByTestId(TEST_IDS.dashboardEmpty)).toBeInTheDocument();
  });

  it('renders the widget grid when ready', () => {
    const widget = buildTasksWidgetView();
    render(<DashboardView {...buildDashboardView({ status: 'ready', widgets: [widget] })} />);

    expect(screen.getByTestId(widget.testId)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.dashboardLoading)).not.toBeInTheDocument();
  });

  it('omits the updated label when the projection time is unknown', () => {
    render(
      <DashboardView
        {...buildDashboardView({ status: 'ready', updatedLabel: null, widgets: [] })}
      />,
    );

    expect(screen.queryByText('Updated July 18, 2026')).not.toBeInTheDocument();
  });
});
