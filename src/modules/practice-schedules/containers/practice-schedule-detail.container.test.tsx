import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useRouteParam } from '@/packages/router';
import { TEST_IDS } from '@/shared/config';

import { buildPracticeScheduleDetailScreenView } from '../../../../tests/factories/practice-schedules-view.factory';
import { usePracticeScheduleDetailScreen } from '../hooks/use-practice-schedule-detail-screen.hook';
import { PracticeScheduleDetailContainer } from './practice-schedule-detail.container';

vi.mock('@/packages/router', () => ({ useRouteParam: vi.fn() }));
vi.mock('../hooks/use-practice-schedule-detail-screen.hook', () => ({
  usePracticeScheduleDetailScreen: vi.fn(),
}));

describe('PracticeScheduleDetailContainer', () => {
  it('hands the routed schedule id to the screen hook', () => {
    vi.mocked(useRouteParam).mockReturnValue('s1');
    vi.mocked(usePracticeScheduleDetailScreen).mockReturnValue(
      buildPracticeScheduleDetailScreenView(),
    );

    render(<PracticeScheduleDetailContainer />);

    expect(usePracticeScheduleDetailScreen).toHaveBeenCalledWith('s1');
    expect(screen.getByTestId(TEST_IDS.practiceScheduleDetailPage)).toBeInTheDocument();
  });

  /**
   * The literal `/practice-schedules/new` route never matches `:scheduleId`,
   * so `useRouteParam` returns null there — that null is what the screen hook
   * reads as create mode.
   */
  it('hands null to the screen hook on the create route', () => {
    vi.mocked(useRouteParam).mockReturnValue(null);
    vi.mocked(usePracticeScheduleDetailScreen).mockReturnValue(
      buildPracticeScheduleDetailScreenView({ isCreateMode: true }),
    );

    render(<PracticeScheduleDetailContainer />);

    expect(usePracticeScheduleDetailScreen).toHaveBeenCalledWith(null);
  });
});
