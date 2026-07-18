import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPracticeSessionScreenView } from '../../../../../tests/factories/practice-view.factory';
import { PracticeSessionDetailsView } from './practice-session-details-view.component';

describe('PracticeSessionDetailsView', () => {
  it('renders the full detail body when ready', () => {
    render(<PracticeSessionDetailsView {...buildPracticeSessionScreenView()} />);

    expect(screen.getByTestId(TEST_IDS.rsvpControl)).toBeInTheDocument();
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
