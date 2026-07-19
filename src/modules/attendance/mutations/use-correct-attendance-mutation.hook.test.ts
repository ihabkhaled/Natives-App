import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { actOnHook } from '../../../../tests/setup/render-with-providers.helper';
import type { AttendanceCorrection, AttendanceRecord } from '../types/attendance.types';
import { correctAttendance } from '../services/correct-attendance.service';
import { useCorrectAttendanceMutation } from './use-correct-attendance-mutation.hook';

vi.mock('../services/correct-attendance.service', () => ({ correctAttendance: vi.fn() }));

const CORRECTION: AttendanceCorrection = {
  membershipId: 'm-1',
  status: 'present_on_time',
  latenessMinutes: null,
  excuseCategory: null,
  expectedVersion: 2,
  reason: 'scanner outage',
};

const RECORD: AttendanceRecord = {
  membershipId: 'm-1',
  status: 'present_on_time',
  version: 3,
  recordedAtIso: '2026-07-26T15:05:00.000Z',
};

function renderCorrect() {
  const onSuccess = vi.fn();
  const onError = vi.fn();
  actOnHook(
    () => useCorrectAttendanceMutation('team-1', 'sess-1', { onSuccess, onError }),
    (api) => {
      api.correct(CORRECTION);
    },
  );
  return { onSuccess, onError };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useCorrectAttendanceMutation', () => {
  it('submits the correction and invokes the success callback', async () => {
    vi.mocked(correctAttendance).mockResolvedValue(RECORD);

    const { onSuccess } = renderCorrect();

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
    expect(correctAttendance).toHaveBeenCalledWith('team-1', 'sess-1', CORRECTION);
  });

  it('routes a rejected correction to the error callback', async () => {
    vi.mocked(correctAttendance).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Conflict }));

    const { onSuccess, onError } = renderCorrect();

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
