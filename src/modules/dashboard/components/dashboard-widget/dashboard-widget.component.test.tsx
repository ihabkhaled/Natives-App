import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildTasksWidgetView } from '../../../../../tests/factories/dashboard-view.factory';
import { DashboardWidget } from './dashboard-widget.component';

describe('DashboardWidget', () => {
  it('renders the title, freshness, and prepared body when content is available', () => {
    const widget = buildTasksWidgetView({
      title: 'Your next sessions',
      freshnessLabel: 'As of today',
    });
    render(<DashboardWidget widget={widget} />);

    expect(screen.getByTestId(widget.testId)).toBeInTheDocument();
    expect(screen.getByText('Your next sessions')).toBeInTheDocument();
    expect(screen.getByText('As of today')).toBeInTheDocument();
    expect(screen.getAllByTestId(TEST_IDS.dashboardTaskItem).length).toBeGreaterThan(0);
  });

  it('shows the state note instead of content when the widget is unavailable', () => {
    render(
      <DashboardWidget
        widget={buildTasksWidgetView({
          showsContent: false,
          stateLabel: 'This section could not load.',
          tasks: [],
        })}
      />,
    );

    expect(screen.getByText('This section could not load.')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.dashboardTaskItem)).not.toBeInTheDocument();
  });

  it('shows a partial notice alongside the content', () => {
    render(
      <DashboardWidget
        widget={buildTasksWidgetView({ partialLabel: 'Some of this section is still loading.' })}
      />,
    );

    expect(screen.getByText('Some of this section is still loading.')).toBeInTheDocument();
  });

  it('omits the freshness note when the as-of instant is unknown', () => {
    const widget = buildTasksWidgetView({ freshnessLabel: null, title: 'Coaching schedule' });
    render(<DashboardWidget widget={widget} />);

    expect(screen.getByText('Coaching schedule')).toBeInTheDocument();
  });
});
