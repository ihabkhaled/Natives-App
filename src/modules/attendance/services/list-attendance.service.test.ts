import { afterEach, describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { makeSheetDto } from '@/tests/msw/attendance-wire.fixture';
import { requestAttendanceSheet } from '../gateways/attendance.gateway';
import { listAttendance } from './list-attendance.service';

vi.mock('../gateways/attendance.gateway', () => ({ requestAttendanceSheet: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('listAttendance', () => {
  it('loads the first bounded roster page and maps it into the domain', async () => {
    vi.mocked(requestAttendanceSheet).mockResolvedValue(makeSheetDto());

    const sheet = await listAttendance('team-1', 'sess-1');

    expect(requestAttendanceSheet).toHaveBeenCalledWith('team-1', 'sess-1', 100, 0);
    expect(sheet.sessionId).toBe('sess-1');
    expect(sheet.items).toHaveLength(1);
  });

  it('maps a transport failure to an AppError', async () => {
    vi.mocked(requestAttendanceSheet).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Forbidden }),
    );

    await expect(listAttendance('team-1', 'sess-1')).rejects.toBeInstanceOf(AppError);
  });

  it('normalizes a non-transport failure to an unexpected AppError', async () => {
    vi.mocked(requestAttendanceSheet).mockRejectedValue('boom');

    await expect(listAttendance('team-1', 'sess-1')).rejects.toMatchObject({
      code: APP_ERROR_CODE.Unexpected,
    });
  });
});
