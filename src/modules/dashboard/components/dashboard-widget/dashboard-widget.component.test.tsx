import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildTasksWidgetView } from '../../../../../tests/factories/dashboard-view.factory';
import { DashboardWidget } from './dashboard-widget.component';

const onRetry = vi.fn();

describe('DashboardWidget', () => {
  it('renders the title, freshness, and prepared body when content is available', () => {
    const widget = buildTasksWidgetView({
      title: 'Your next sessions',
      freshnessLabel: 'As of today',
    });
    render(<DashboardWidget widget={widget} retryLabel="Try again" onRetry={onRetry} />);

    expect(screen.getByTestId(widget.testId)).toBeInTheDocument();
    expect(screen.getByText('Your next sessions')).toBeInTheDocument();
    expect(screen.getByText('As of today')).toBeInTheDocument();
    expect(screen.getAllByTestId(TEST_IDS.dashboardTaskItem).length).toBeGreaterThan(0);
  });

  it('shows the designed error state with a retry action when the widget is unavailable', async () => {
    render(
      <DashboardWidget
        widget={buildTasksWidgetView({
          showsContent: false,
          stateKind: 'unavailable',
          stateLabel: 'This section could not load.',
          stateMessage: 'Retry to fetch it again.',
          tasks: [],
        })}
        retryLabel="Try again"
        onRetry={onRetry}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.errorState)).toBeInTheDocument();
    expect(screen.getByText('This section could not load.')).toBeInTheDocument();
    expect(screen.getByText('Retry to fetch it again.')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.dashboardTaskItem)).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Try again'));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows the calm empty state without a retry action when the widget has no data', () => {
    render(
      <DashboardWidget
        widget={buildTasksWidgetView({
          showsContent: false,
          stateKind: 'empty',
          stateLabel: 'Nothing here yet.',
          tasks: [],
        })}
        retryLabel="Try again"
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.errorState)).not.toBeInTheDocument();
    expect(screen.queryByText('Try again')).not.toBeInTheDocument();
  });

  it('omits the supporting line when the failure carries none', () => {
    render(
      <DashboardWidget
        widget={buildTasksWidgetView({
          showsContent: false,
          stateKind: 'unavailable',
          stateLabel: 'This section could not load.',
          stateMessage: null,
          tasks: [],
        })}
        retryLabel="Try again"
        onRetry={onRetry}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.errorState)).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('shows a partial notice alongside the content', () => {
    render(
      <DashboardWidget
        widget={buildTasksWidgetView({ partialLabel: 'Some of this section is still loading.' })}
        retryLabel="Try again"
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText('Some of this section is still loading.')).toBeInTheDocument();
  });

  it('omits the freshness note when the as-of instant is unknown', () => {
    const widget = buildTasksWidgetView({ freshnessLabel: null, title: 'Coaching schedule' });
    render(<DashboardWidget widget={widget} retryLabel="Try again" onRetry={onRetry} />);

    expect(screen.getByText('Coaching schedule')).toBeInTheDocument();
  });
});
