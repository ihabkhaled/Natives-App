import { afterEach, describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { makeStatusDto } from '@/tests/msw/attendance-wire.fixture';
import { requestAttendanceFinalization } from '../gateways/attendance.gateway';
import { finalizeAttendance } from './finalize-attendance.service';

vi.mock('../gateways/attendance.gateway', () => ({ requestAttendanceFinalization: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('finalizeAttendance', () => {
  it('finalizes with the expected version and maps the status projection', async () => {
    vi.mocked(requestAttendanceFinalization).mockResolvedValue(makeStatusDto());

    const finalization = await finalizeAttendance('team-1', 'sess-1', 3);

    expect(requestAttendanceFinalization).toHaveBeenCalledWith('team-1', 'sess-1', 3);
    expect(finalization.state).toBe('finalized');
    expect(finalization.recordCount).toBe(4);
  });

  it('maps a stale-version rejection to an AppError', async () => {
    vi.mocked(requestAttendanceFinalization).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Conflict }),
    );

    await expect(finalizeAttendance('team-1', 'sess-1', 3)).rejects.toBeInstanceOf(AppError);
  });

  it('wraps a non-transport failure as unexpected', async () => {
    vi.mocked(requestAttendanceFinalization).mockRejectedValue(undefined);

    await expect(finalizeAttendance('team-1', 'sess-1', 3)).rejects.toMatchObject({
      code: APP_ERROR_CODE.Unexpected,
    });
  });
});
