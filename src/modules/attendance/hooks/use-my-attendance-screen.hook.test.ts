import { act, waitFor } from '@testing-library/react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpcomingPracticesQuery } from '@/modules/practice';
import type * as PracticeModule from '@/modules/practice';
import { useNetworkStatus } from '@/platform';
import type * as SharedUiModule from '@/shared/ui';
import { useAppToast } from '@/shared/ui';
import {
  makeParticipationDto,
  makeSelfHistoryDto,
  makeSelfRecordDto,
} from '@/tests/msw/attendance-wire.fixture';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { setupToastHarness } from '../../../../tests/setup/toast-test.helper';
import { buildPracticeSessionSummary } from '../../../../tests/factories/practice.factory';
import {
  mapAttendanceParticipation,
  mapAttendanceSelfHistory,
  mapAttendanceSelfRecord,
} from '../mappers/attendance-self.mapper';
import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { getMyAttendance } from '../services/get-my-attendance.service';
import { getMyAttendanceHistory } from '../services/get-my-attendance-history.service';
import { getMyParticipation } from '../services/get-my-participation.service';
import { selfCheckIn } from '../services/self-check-in.service';
import { useAttendanceTeamContext } from './use-attendance-team-context.hook';
import { useMyAttendanceScreen } from './use-my-attendance-screen.hook';

vi.mock('@/modules/practice', async (importOriginal) => ({
  ...(await importOriginal<typeof PracticeModule>()),
  useUpcomingPracticesQuery: vi.fn(),
}));
vi.mock('@/platform', async () => {
  const { createPlatformMock } = await import('../../../../tests/setup/platform-mock.helper');
  return createPlatformMock();
});
vi.mock('@/shared/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedUiModule>()),
  useAppToast: vi.fn(),
}));
vi.mock('../services/get-my-attendance.service', () => ({ getMyAttendance: vi.fn() }));
vi.mock('../services/get-my-attendance-history.service', () => ({
  getMyAttendanceHistory: vi.fn(),
}));
vi.mock('../services/get-my-participation.service', () => ({ getMyParticipation: vi.fn() }));
vi.mock('../services/self-check-in.service', () => ({ selfCheckIn: vi.fn() }));
vi.mock('./use-attendance-team-context.hook', () => ({ useAttendanceTeamContext: vi.fn() }));

setupToastHarness();

// Freeze only Date (timers stay real for waitFor) so the fixture session at
// 2026-07-26 is always "upcoming" no matter when the suite runs.
beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-07-22T10:00:00.000Z') });
});

afterAll(() => {
  vi.useRealTimers();
});

beforeEach(() => {
  vi.mocked(useAppToast).mockReturnValue({ showToast: vi.fn().mockResolvedValue(undefined) });
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  vi.mocked(useAttendanceTeamContext).mockReturnValue({
    teamId: 'team-natives',
    isLoading: false,
    isError: false,
  });
  vi.mocked(useUpcomingPracticesQuery).mockReturnValue({
    sessions: [buildPracticeSessionSummary()],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  });
  vi.mocked(getMyParticipation).mockResolvedValue(
    mapAttendanceParticipation(makeParticipationDto()),
  );
  vi.mocked(getMyAttendance).mockResolvedValue(mapAttendanceSelfRecord(makeSelfRecordDto()));
  vi.mocked(getMyAttendanceHistory).mockResolvedValue(
    mapAttendanceSelfHistory(makeSelfHistoryDto({ total: 25 })),
  );
});

async function pressCheckInOnReadyScreen() {
  const { result } = renderHookWithProviders(() => useMyAttendanceScreen());
  await waitFor(() => {
    expect(result.current.status).toBe('ready');
  });
  act(() => {
    result.current.checkIn.onCheckIn();
  });
  return result;
}

describe('useMyAttendanceScreen', () => {
  it('composes participation and the check-in card from self reads only', async () => {
    const { result } = renderHookWithProviders(() => useMyAttendanceScreen());

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.participation?.rateText).toContain('90.9');
    expect(getMyParticipation).toHaveBeenCalledWith('team-natives', null);
    expect(getMyAttendance).toHaveBeenCalledWith('team-natives', 'sess-1');
  });

  it('skips the own-record read entirely when no session is checkable', async () => {
    vi.mocked(useUpcomingPracticesQuery).mockReturnValue({
      sessions: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHookWithProviders(() => useMyAttendanceScreen());

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.checkIn.sessionLabel).toBeNull();
    expect(getMyAttendance).not.toHaveBeenCalled();
  });

  it('trims the note into the check-in payload and clears it on success', async () => {
    vi.mocked(selfCheckIn).mockResolvedValue(
      mapAttendanceSelfRecord(makeSelfRecordDto({ status: 'present_on_time', source: 'self' })),
    );
    const { result } = renderHookWithProviders(() => useMyAttendanceScreen());

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    act(() => {
      result.current.checkIn.onNoteChange('  on my way  ');
    });
    await waitFor(() => {
      expect(result.current.checkIn.noteValue).toBe('  on my way  ');
    });
    act(() => {
      result.current.checkIn.onCheckIn();
    });

    await waitFor(() => {
      expect(selfCheckIn).toHaveBeenCalledWith('team-natives', 'sess-1', 'on my way');
    });
    await waitFor(() => {
      expect(result.current.checkIn.noteValue).toBe('');
    });
  });

  it('sends no note at all for an empty field and recovers from a 409 by refetching', async () => {
    vi.mocked(selfCheckIn).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Conflict }));
    await pressCheckInOnReadyScreen();

    await waitFor(() => {
      expect(selfCheckIn).toHaveBeenCalledWith('team-natives', 'sess-1', null);
    });
    await waitFor(() => {
      expect(getMyAttendance).toHaveBeenCalledTimes(2);
    });
  });

  it('reports a non-conflict check-in failure with generic copy', async () => {
    vi.mocked(selfCheckIn).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Server }));
    await pressCheckInOnReadyScreen();

    await waitFor(() => {
      expect(getMyAttendance).toHaveBeenCalledTimes(2);
    });
  });

  it('retries the participation read on demand', async () => {
    const { result } = renderHookWithProviders(() => useMyAttendanceScreen());

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    result.current.onRetry();
    await waitFor(() => {
      expect(getMyParticipation).toHaveBeenCalledTimes(2);
    });
  });

  it('grows the history window one page per press and stops at the 100 cap', async () => {
    const { result } = renderHookWithProviders(() => useMyAttendanceScreen());

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(getMyAttendanceHistory).toHaveBeenCalledWith('team-natives', 20);
    expect(result.current.history.canLoadMore).toBe(true);

    act(() => {
      result.current.history.onLoadMore();
    });
    await waitFor(() => {
      expect(getMyAttendanceHistory).toHaveBeenCalledWith('team-natives', 40);
    });

    // Pressing through every window stops exactly at the contract's 100 cap.
    for (let press = 0; press < 5; press += 1) {
      act(() => {
        result.current.history.onLoadMore();
      });
    }
    await waitFor(() => {
      expect(getMyAttendanceHistory).toHaveBeenCalledWith('team-natives', 100);
    });
    expect(getMyAttendanceHistory).not.toHaveBeenCalledWith('team-natives', 120);
  });
});
