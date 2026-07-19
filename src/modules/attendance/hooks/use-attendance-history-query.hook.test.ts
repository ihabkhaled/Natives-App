import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import type { AttendanceRevision } from '../types/attendance.types';
import { getAttendanceHistory } from '../services/get-attendance-history.service';
import { useAttendanceHistoryQuery } from './use-attendance-history-query.hook';

vi.mock('../services/get-attendance-history.service', () => ({ getAttendanceHistory: vi.fn() }));

const REVISIONS: readonly AttendanceRevision[] = [
  {
    id: 'rev-1',
    fromStatus: null,
    toStatus: 'present_on_time',
    latenessMinutes: null,
    excuseCategory: null,
    correctionReason: 'scanner outage',
    occurredAtIso: '2026-07-26T15:05:00.000Z',
  },
];

afterEach(() => {
  vi.clearAllMocks();
});

describe('useAttendanceHistoryQuery', () => {
  it('loads the bounded revision history for a member', async () => {
    vi.mocked(getAttendanceHistory).mockResolvedValue(REVISIONS);

    const { result } = renderHookWithProviders(() =>
      useAttendanceHistoryQuery('team-1', 'sess-1', 'm-1'),
    );

    await waitFor(() => {
      expect(result.current.revisions).toHaveLength(1);
    });
  });

  it('stays idle and does not fetch without a selected member', () => {
    const { result } = renderHookWithProviders(() =>
      useAttendanceHistoryQuery('team-1', 'sess-1', ''),
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.revisions).toEqual([]);
    expect(getAttendanceHistory).not.toHaveBeenCalled();
  });

  it('surfaces a history failure as an AppError', async () => {
    vi.mocked(getAttendanceHistory).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Forbidden }),
    );

    const { result } = renderHookWithProviders(() =>
      useAttendanceHistoryQuery('team-1', 'sess-1', 'm-1'),
    );

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
  });
});
