import { afterEach, describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { makeRecordDto } from '@/tests/msw/attendance-wire.fixture';
import type { AttendanceCorrection } from '../types/attendance.types';
import { requestAttendanceCorrection } from '../gateways/attendance.gateway';
import { correctAttendance } from './correct-attendance.service';

vi.mock('../gateways/attendance.gateway', () => ({ requestAttendanceCorrection: vi.fn() }));

const CORRECTION: AttendanceCorrection = {
  membershipId: 'm-1',
  status: 'present_on_time',
  latenessMinutes: null,
  excuseCategory: null,
  expectedVersion: 2,
  reason: 'scanner outage',
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('correctAttendance', () => {
  it('submits the correction and maps the resulting record', async () => {
    vi.mocked(requestAttendanceCorrection).mockResolvedValue(makeRecordDto());

    const record = await correctAttendance('team-1', 'sess-1', CORRECTION);

    expect(requestAttendanceCorrection).toHaveBeenCalledWith('team-1', 'sess-1', CORRECTION);
    expect(record.membershipId).toBe('m-1');
  });

  it('maps a rejected correction to an AppError', async () => {
    vi.mocked(requestAttendanceCorrection).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Conflict }),
    );

    await expect(correctAttendance('team-1', 'sess-1', CORRECTION)).rejects.toBeInstanceOf(
      AppError,
    );
  });

  it('wraps a non-transport failure as unexpected', async () => {
    vi.mocked(requestAttendanceCorrection).mockRejectedValue('nope');

    await expect(correctAttendance('team-1', 'sess-1', CORRECTION)).rejects.toMatchObject({
      code: APP_ERROR_CODE.Unexpected,
    });
  });
});
