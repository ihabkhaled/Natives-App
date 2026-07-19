import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import type { AttendanceFinalization } from '../types/attendance.types';
import { finalizeAttendance } from '../services/finalize-attendance.service';
import { useFinalizeAttendanceMutation } from './use-finalize-attendance-mutation.hook';

vi.mock('../services/finalize-attendance.service', () => ({ finalizeAttendance: vi.fn() }));

const FINALIZATION: AttendanceFinalization = {
  state: 'finalized',
  finalizedAtIso: '2026-07-26T17:10:00.000Z',
  recordCount: 4,
  version: 5,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('useFinalizeAttendanceMutation', () => {
  it('finalizes with the expected version and invokes the success callback', async () => {
    vi.mocked(finalizeAttendance).mockResolvedValue(FINALIZATION);
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const { result } = renderHookWithProviders(() =>
      useFinalizeAttendanceMutation('team-1', 'sess-1', { onSuccess, onError }),
    );
    act(() => {
      result.current.finalize(3);
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
    expect(finalizeAttendance).toHaveBeenCalledWith('team-1', 'sess-1', 3);
  });

  it('routes a finalize failure to the error callback', async () => {
    vi.mocked(finalizeAttendance).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Conflict }));
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const { result } = renderHookWithProviders(() =>
      useFinalizeAttendanceMutation('team-1', 'sess-1', { onSuccess, onError }),
    );
    act(() => {
      result.current.finalize(3);
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
