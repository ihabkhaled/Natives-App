import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPracticeSessionScreenView } from '../../../../../tests/factories/practice-view.factory';
import { PracticeSessionDetailsView } from './practice-session-details-view.component';

describe('PracticeSessionDetailsView', () => {
  it('renders the full detail body when ready', () => {
    render(<PracticeSessionDetailsView {...buildPracticeSessionScreenView()} />);

    expect(screen.getByTestId(TEST_IDS.rsvpControl)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceSessionAttendanceCta)).not.toBeInTheDocument();
  });

  it('offers the attendance CTA to permitted staff and opens the capture screen', () => {
    const onOpen = vi.fn();
    render(
      <PracticeSessionDetailsView
        {...buildPracticeSessionScreenView({
          attendanceCta: { heading: 'Attendance', label: 'Record attendance', onOpen },
        })}
      />,
    );

    const cta = screen.getByTestId(TEST_IDS.practiceSessionAttendanceCta);
    expect(cta).toHaveTextContent('Record attendance');
    fireEvent.click(cta);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('renders the loading, error, offline, and forbidden states', () => {
    const cases = [
      { status: 'loading', testId: TEST_IDS.practiceSessionLoading },
      { status: 'error', testId: TEST_IDS.practiceSessionError },
      { status: 'offline', testId: TEST_IDS.practiceSessionOffline },
      { status: 'forbidden', testId: TEST_IDS.practiceCalendarForbidden },
    ] as const;
    for (const { status, testId } of cases) {
      const { unmount } = render(
        <PracticeSessionDetailsView
          {...buildPracticeSessionScreenView({ status, detail: null })}
        />,
      );
      expect(screen.getByTestId(testId)).toBeInTheDocument();
      unmount();
    }
  });
});
