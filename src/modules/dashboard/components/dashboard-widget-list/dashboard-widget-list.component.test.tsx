import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  buildMetricWidgetView,
  buildTasksWidgetView,
} from '../../../../../tests/factories/dashboard-view.factory';
import { DashboardWidgetList } from './dashboard-widget-list.component';

const onRetry = vi.fn();

describe('DashboardWidgetList', () => {
  it('renders every prepared widget card', () => {
    const tasks = buildTasksWidgetView();
    const metric = buildMetricWidgetView();
    render(
      <DashboardWidgetList
        widgets={[tasks, metric]}
        isOffline={false}
        offlineNoticeLabel="Showing your last saved dashboard."
        retryLabel="Try again"
        onRetry={onRetry}
        onOpenLink={vi.fn()}
      />,
    );

    expect(screen.getByTestId(tasks.testId)).toBeInTheDocument();
    expect(screen.getByTestId(metric.testId)).toBeInTheDocument();
  });

  it('shows a stale-data notice when offline', () => {
    render(
      <DashboardWidgetList
        widgets={[buildTasksWidgetView()]}
        isOffline
        offlineNoticeLabel="Showing your last saved dashboard."
        retryLabel="Try again"
        onRetry={onRetry}
        onOpenLink={vi.fn()}
      />,
    );

    expect(screen.getByText('Showing your last saved dashboard.')).toBeInTheDocument();
  });

  it('hides the stale-data notice when online', () => {
    render(
      <DashboardWidgetList
        widgets={[buildTasksWidgetView()]}
        isOffline={false}
        offlineNoticeLabel="Showing your last saved dashboard."
        retryLabel="Try again"
        onRetry={onRetry}
        onOpenLink={vi.fn()}
      />,
    );

    expect(screen.queryByText('Showing your last saved dashboard.')).not.toBeInTheDocument();
  });
});
