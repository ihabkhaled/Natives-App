import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import type { AttendanceMark } from '../types/attendance.types';
import { queueAttendanceMarks } from '../services/queue-attendance-marks.service';
import { submitBulkAttendance } from '../services/submit-bulk-attendance.service';
import { useBulkAttendanceMutation } from './use-bulk-attendance-mutation.hook';

vi.mock('../services/submit-bulk-attendance.service', () => ({ submitBulkAttendance: vi.fn() }));
vi.mock('../services/queue-attendance-marks.service', () => ({ queueAttendanceMarks: vi.fn() }));

const MARKS: readonly AttendanceMark[] = [
  {
    membershipId: 'm-1',
    status: 'present_on_time',
    latenessMinutes: null,
    excuseCategory: null,
    expectedVersion: 1,
  },
];

function callbacks() {
  return { onSaved: vi.fn(), onQueued: vi.fn(), onError: vi.fn() };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useBulkAttendanceMutation', () => {
  it('saves the marks online and reports the recorded count', async () => {
    vi.mocked(submitBulkAttendance).mockResolvedValue({ recorded: 2, items: [] });
    const cb = callbacks();

    const { result } = renderHookWithProviders(() =>
      useBulkAttendanceMutation('team-1', 'sess-1', true, cb),
    );
    act(() => {
      result.current.submit(MARKS);
    });

    await waitFor(() => {
      expect(cb.onSaved).toHaveBeenCalledWith(2);
    });
    expect(submitBulkAttendance).toHaveBeenCalledOnce();
  });

  it('queues the marks while offline instead of calling the backend', async () => {
    const cb = callbacks();

    const { result } = renderHookWithProviders(() =>
      useBulkAttendanceMutation('team-1', 'sess-1', false, cb),
    );
    act(() => {
      result.current.submit(MARKS);
    });

    await waitFor(() => {
      expect(cb.onQueued).toHaveBeenCalledWith(1);
    });
    expect(queueAttendanceMarks).toHaveBeenCalledOnce();
    expect(submitBulkAttendance).not.toHaveBeenCalled();
  });

  it('falls back to the offline queue when the network drops mid-request', async () => {
    vi.mocked(submitBulkAttendance).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.NetworkOffline }),
    );
    const cb = callbacks();

    const { result } = renderHookWithProviders(() =>
      useBulkAttendanceMutation('team-1', 'sess-1', true, cb),
    );
    act(() => {
      result.current.submit(MARKS);
    });

    await waitFor(() => {
      expect(cb.onQueued).toHaveBeenCalledWith(1);
    });
    expect(queueAttendanceMarks).toHaveBeenCalledOnce();
  });

  it('surfaces a non-network failure through the error callback', async () => {
    vi.mocked(submitBulkAttendance).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Unexpected }),
    );
    const cb = callbacks();

    const { result } = renderHookWithProviders(() =>
      useBulkAttendanceMutation('team-1', 'sess-1', true, cb),
    );
    act(() => {
      result.current.submit(MARKS);
    });

    await waitFor(() => {
      expect(cb.onError).toHaveBeenCalled();
    });
    expect(result.current.error).not.toBeNull();
  });
});
