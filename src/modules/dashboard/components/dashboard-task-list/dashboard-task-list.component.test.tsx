import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildDashboardTaskView } from '../../../../../tests/factories/dashboard-view.factory';
import { DashboardTaskList } from './dashboard-task-list.component';

describe('DashboardTaskList', () => {
  it('lists each task with an optional count badge and time', () => {
    render(
      <DashboardTaskList
        emptyLabel="Nothing here yet."
        tasks={[
          buildDashboardTaskView({
            id: 'rsvp',
            label: 'Chase missing RSVPs',
            countText: '5',
            color: 'danger',
            timeText: 'July 17, 2026',
          }),
          buildDashboardTaskView({ id: 'roster', label: 'Update the match roster' }),
        ]}
      />,
    );

    expect(screen.getAllByTestId(TEST_IDS.dashboardTaskItem)).toHaveLength(2);
    expect(screen.getByText('Chase missing RSVPs')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('July 17, 2026')).toBeInTheDocument();
  });

  it('shows the empty label when there are no tasks', () => {
    render(<DashboardTaskList emptyLabel="Nothing here yet." tasks={[]} />);

    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.dashboardTaskItem)).not.toBeInTheDocument();
  });
});
