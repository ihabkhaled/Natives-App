import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPracticeCalendarView } from '../../../../../tests/factories/practice-view.factory';
import { PracticeCalendarView } from './practice-calendar-view.component';

describe('PracticeCalendarView', () => {
  it('always shows the filter bar and subscription guidance', () => {
    render(<PracticeCalendarView {...buildPracticeCalendarView({ status: 'loading' })} />);

    expect(screen.getByTestId(TEST_IDS.practiceFilterBar)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceSubscriptionNote)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceCalendarLoading)).toBeInTheDocument();
  });

  it('renders the error, offline, forbidden, and empty states', () => {
    const cases = [
      { status: 'error', testId: TEST_IDS.practiceCalendarError },
      { status: 'offline', testId: TEST_IDS.practiceCalendarOffline },
      { status: 'forbidden', testId: TEST_IDS.practiceCalendarForbidden },
      { status: 'empty', testId: TEST_IDS.practiceCalendarEmpty },
    ] as const;
    for (const { status, testId } of cases) {
      const { unmount } = render(
        <PracticeCalendarView {...buildPracticeCalendarView({ status })} />,
      );
      expect(screen.getByTestId(testId)).toBeInTheDocument();
      unmount();
    }
  });

  it('renders day sections and an offline banner when ready and offline', () => {
    render(
      <PracticeCalendarView {...buildPracticeCalendarView({ status: 'ready', isOffline: true })} />,
    );

    expect(screen.getByTestId(TEST_IDS.practiceDaySection)).toBeInTheDocument();
    expect(screen.getByText('Showing saved sessions.')).toBeInTheDocument();
  });

  it('offers load-more and a bounded notice', () => {
    const onLoadMore = vi.fn();
    render(
      <PracticeCalendarView
        {...buildPracticeCalendarView({
          status: 'ready',
          hasMore: true,
          onLoadMore,
          boundedNotice: 'Showing the first 100 sessions.',
        })}
      />,
    );

    expect(screen.getByText('Showing the first 100 sessions.')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceLoadMoreButton));
    expect(onLoadMore).toHaveBeenCalledOnce();
  });
});
