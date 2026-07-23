import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { useMyAttendanceScreen } from '../hooks/use-my-attendance-screen.hook';
import { MyAttendanceContainer } from './my-attendance.container';

vi.mock('../hooks/use-my-attendance-screen.hook', () => ({ useMyAttendanceScreen: vi.fn() }));

describe('MyAttendanceContainer', () => {
  it('hands the prepared screen view to the presentational component', () => {
    vi.mocked(useMyAttendanceScreen).mockReturnValue({
      title: 'My attendance',
      subtitle: '',
      privacyNotice: '',
      status: 'loading',
      loadingLabel: 'Loading…',
      errorTitle: '',
      errorMessage: '',
      retryLabel: '',
      onRetry: vi.fn(),
      offlineTitle: '',
      offlineMessage: '',
      forbiddenTitle: '',
      forbiddenMessage: '',
      emptyTitle: '',
      emptyMessage: '',
      participation: null,
      checkIn: {
        title: '',
        sessionLabel: null,
        noSessionMessage: '',
        isLoading: false,
        loadingLabel: '',
        statusChip: null,
        stateMessage: null,
        offlineNotice: null,
        canCheckIn: false,
        checkInLabel: '',
        isSubmitting: false,
        noteLabel: '',
        noteValue: '',
        onNoteChange: vi.fn(),
        onCheckIn: vi.fn(),
      },
      history: {
        title: '',
        isLoading: false,
        loadingLabel: '',
        rows: [],
        emptyTitle: '',
        emptyMessage: '',
        loadMoreLabel: '',
        canLoadMore: false,
        onLoadMore: vi.fn(),
      },
    });

    render(<MyAttendanceContainer />);

    expect(screen.getByTestId(TEST_IDS.myAttendanceLoading)).toBeInTheDocument();
  });
});
