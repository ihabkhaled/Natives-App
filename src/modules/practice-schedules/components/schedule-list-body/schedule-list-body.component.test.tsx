import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPracticeSchedulesScreenView } from '../../../../../tests/factories/practice-schedules-view.factory';
import { ScheduleListBody } from './schedule-list-body.component';

describe('ScheduleListBody', () => {
  it('renders the count and every row when there are matches', () => {
    const view = buildPracticeSchedulesScreenView();
    render(<ScheduleListBody {...view} />);

    expect(screen.getByText(view.countLabel)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceSchedulesList)).toBeInTheDocument();
  });

  it('renders the empty state instead of a list when there are none', () => {
    render(<ScheduleListBody {...buildPracticeSchedulesScreenView({ hasSchedules: false, rows: [] })} />);

    expect(screen.getByTestId(TEST_IDS.practiceSchedulesEmpty)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceSchedulesList)).not.toBeInTheDocument();
  });

  it('runs the new-schedule action', () => {
    const onNew = vi.fn();
    render(<ScheduleListBody {...buildPracticeSchedulesScreenView({ onNew })} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceSchedulesNew));

    expect(onNew).toHaveBeenCalledTimes(1);
  });
});
