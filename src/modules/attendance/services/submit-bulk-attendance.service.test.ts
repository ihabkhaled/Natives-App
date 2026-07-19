import { afterEach, describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { makeBulkDto } from '@/tests/msw/attendance-wire.fixture';
import type { AttendanceMark } from '../types/attendance.types';
import { requestBulkAttendance } from '../gateways/attendance.gateway';
import { submitBulkAttendance } from './submit-bulk-attendance.service';

vi.mock('../gateways/attendance.gateway', () => ({ requestBulkAttendance: vi.fn() }));

const MARKS: readonly AttendanceMark[] = [
  {
    membershipId: 'm-1',
    status: 'present_on_time',
    latenessMinutes: null,
    excuseCategory: null,
    expectedVersion: 1,
  },
];

afterEach(() => {
  vi.clearAllMocks();
});

describe('submitBulkAttendance', () => {
  it('records the atomic bulk mark and maps the recorded result', async () => {
    vi.mocked(requestBulkAttendance).mockResolvedValue(makeBulkDto({ recorded: 1 }));

    const result = await submitBulkAttendance('team-1', 'sess-1', MARKS);

    expect(requestBulkAttendance).toHaveBeenCalledWith('team-1', 'sess-1', MARKS);
    expect(result.recorded).toBe(1);
  });

  it('maps a version conflict to an AppError', async () => {
    vi.mocked(requestBulkAttendance).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Conflict }),
    );

    await expect(submitBulkAttendance('team-1', 'sess-1', MARKS)).rejects.toBeInstanceOf(AppError);
  });

  it('wraps a non-transport failure as unexpected', async () => {
    vi.mocked(requestBulkAttendance).mockRejectedValue(new Error('offline'));

    await expect(submitBulkAttendance('team-1', 'sess-1', MARKS)).rejects.toMatchObject({
      code: APP_ERROR_CODE.Unexpected,
    });
  });
});
