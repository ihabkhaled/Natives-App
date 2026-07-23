import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import type {
  MyAttendanceScreenView,
  SelfCheckInCardView,
} from '../../types/attendance-view.types';
import { MyAttendanceView } from './my-attendance-view.component';

function buildCheckIn(): SelfCheckInCardView {
  return {
    title: 'Session check-in',
    sessionLabel: 'Evening practice',
    noSessionMessage: 'No upcoming session.',
    isLoading: false,
    loadingLabel: 'Loading…',
    statusChip: null,
    stateMessage: null,
    provisionalNotice: null,
    offlineNotice: null,
    canCheckIn: false,
    checkInLabel: 'Check in',
    isSubmitting: false,
    noteLabel: 'Note',
    noteValue: '',
    onNoteChange: vi.fn(),
    onCheckIn: vi.fn(),
  };
}

function buildScreen(overrides: Partial<MyAttendanceScreenView> = {}): MyAttendanceScreenView {
  return {
    title: 'My attendance',
    subtitle: 'Your participation and check-in.',
    privacyNotice: 'This page shows only your own attendance.',
    status: 'ready',
    loadingLabel: 'Loading…',
    errorTitle: 'Something went wrong',
    errorMessage: 'Try again.',
    retryLabel: 'Try again',
    onRetry: vi.fn(),
    offlineTitle: 'You are offline',
    offlineMessage: 'Reconnect.',
    forbiddenTitle: 'No access',
    forbiddenMessage: 'Not permitted.',
    emptyTitle: 'No attendance yet',
    emptyMessage: 'Records appear later.',
    participation: {
      title: 'Participation',
      rateLabel: 'Attendance rate',
      rateText: '90.9%',
      hasRate: true,
      breakdown: [],
      ruleNotice: 'Based on finalized sessions only',
      candidateNotice: null,
      isNotConfigured: false,
      notConfiguredMessage: 'Not configured yet.',
    },
    checkIn: buildCheckIn(),
    ...overrides,
  };
}

describe('MyAttendanceView', () => {
  it('renders both self cards and the privacy notice when ready', () => {
    render(<MyAttendanceView {...buildScreen()} />);

    expect(screen.getByTestId(TEST_IDS.myAttendanceCheckInCard)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.myAttendanceParticipationCard)).toBeInTheDocument();
    expect(screen.getByText('This page shows only your own attendance.')).toBeInTheDocument();
  });

  it('tolerates a missing participation card while it loads', () => {
    render(<MyAttendanceView {...buildScreen({ participation: null })} />);

    expect(screen.queryByTestId(TEST_IDS.myAttendanceParticipationCard)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.myAttendanceCheckInCard)).toBeInTheDocument();
  });

  it('renders each designed non-ready state and nothing else', () => {
    const cases = [
      { status: 'loading', testId: TEST_IDS.myAttendanceLoading },
      { status: 'error', testId: TEST_IDS.myAttendanceError },
      { status: 'offline', testId: TEST_IDS.myAttendanceOffline },
      { status: 'forbidden', testId: TEST_IDS.myAttendanceForbidden },
      { status: 'empty', testId: TEST_IDS.myAttendanceEmpty },
    ] as const;
    for (const { status, testId } of cases) {
      const { unmount } = render(<MyAttendanceView {...buildScreen({ status })} />);
      expect(screen.getByTestId(testId)).toBeInTheDocument();
      expect(screen.queryByTestId(TEST_IDS.myAttendanceCheckInCard)).not.toBeInTheDocument();
      unmount();
    }
  });
});
