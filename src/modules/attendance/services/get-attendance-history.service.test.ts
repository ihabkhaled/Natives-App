import { afterEach, describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { makeHistoryDto } from '@/tests/msw/attendance-wire.fixture';
import { requestAttendanceHistory } from '../gateways/attendance.gateway';
import { getAttendanceHistory } from './get-attendance-history.service';

vi.mock('../gateways/attendance.gateway', () => ({ requestAttendanceHistory: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('getAttendanceHistory', () => {
  it('reads the bounded revision history and maps it into the domain', async () => {
    vi.mocked(requestAttendanceHistory).mockResolvedValue(makeHistoryDto());

    const revisions = await getAttendanceHistory('team-1', 'sess-1', 'm-1');

    expect(requestAttendanceHistory).toHaveBeenCalledWith('team-1', 'sess-1', 'm-1');
    expect(revisions).toHaveLength(1);
    expect(revisions[0]?.id).toBe('rev-1');
  });

  it('maps a forbidden read to an AppError', async () => {
    vi.mocked(requestAttendanceHistory).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Forbidden }),
    );

    await expect(getAttendanceHistory('team-1', 'sess-1', 'm-1')).rejects.toBeInstanceOf(AppError);
  });

  it('wraps a non-transport failure as unexpected', async () => {
    vi.mocked(requestAttendanceHistory).mockRejectedValue({ weird: true });

    await expect(getAttendanceHistory('team-1', 'sess-1', 'm-1')).rejects.toMatchObject({
      code: APP_ERROR_CODE.Unexpected,
    });
  });
});
