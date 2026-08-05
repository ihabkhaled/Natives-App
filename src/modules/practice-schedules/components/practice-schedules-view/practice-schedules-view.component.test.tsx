import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPracticeSchedulesScreenView } from '../../../../../tests/factories/practice-schedules-view.factory';
import { PracticeSchedulesView } from './practice-schedules-view.component';

describe('PracticeSchedulesView', () => {
  it('renders the count and the schedule rows when ready', () => {
    render(<PracticeSchedulesView {...buildPracticeSchedulesScreenView()} />);

    expect(screen.getByTestId(TEST_IDS.practiceSchedulesList)).toBeInTheDocument();
    expect(screen.getAllByTestId(TEST_IDS.practiceScheduleRow)).toHaveLength(1);
  });

  it('shows the empty state when there are no schedules yet', () => {
    render(
      <PracticeSchedulesView
        {...buildPracticeSchedulesScreenView({ hasSchedules: false, rows: [] })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.practiceSchedulesEmpty)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceSchedulesList)).not.toBeInTheDocument();
  });

  it('shows the permission state and no rows when forbidden', () => {
    render(
      <PracticeSchedulesView
        {...buildPracticeSchedulesScreenView({ isForbidden: true, isLoading: true })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.practiceSchedulesForbidden)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceSchedulesLoading)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceSchedulesNew)).not.toBeInTheDocument();
  });

  it('shows the loader while the list is still arriving', () => {
    render(<PracticeSchedulesView {...buildPracticeSchedulesScreenView({ isLoading: true })} />);

    expect(screen.getByTestId(TEST_IDS.practiceSchedulesLoading)).toBeInTheDocument();
  });

  it('shows the error state once the read has failed', () => {
    render(<PracticeSchedulesView {...buildPracticeSchedulesScreenView({ hasError: true })} />);

    expect(screen.getByTestId(TEST_IDS.practiceSchedulesError)).toBeInTheDocument();
  });

  it('runs the new-schedule action from its own button', () => {
    const onNew = vi.fn();
    render(<PracticeSchedulesView {...buildPracticeSchedulesScreenView({ onNew })} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceSchedulesNew));

    expect(onNew).toHaveBeenCalledTimes(1);
  });

  it('opens a schedule when its row is pressed', () => {
    const onOpen = vi.fn();
    render(<PracticeSchedulesView {...buildPracticeSchedulesScreenView({ onOpen })} />);

    fireEvent.click(screen.getByText('Tuesday & Thursday practice'));

    expect(onOpen).toHaveBeenCalledWith('schedule-mock-1');
  });

  it('marks an archived schedule with its status chip', () => {
    render(
      <PracticeSchedulesView
        {...buildPracticeSchedulesScreenView({
          rows: [
            {
              id: 's2',
              name: 'Retired schedule',
              summary: 'Weekly · Mon · 09:00',
              statusLabel: 'Archived',
              isArchived: true,
              detailPath: '/practice-schedules/s2',
            },
          ],
        })}
      />,
    );

    // StatusChip renders the label twice (a screen-reader span plus a
    // visible aria-hidden span), so both matches confirm the chip rendered.
    expect(screen.getAllByText('Archived')).toHaveLength(2);
  });
});
