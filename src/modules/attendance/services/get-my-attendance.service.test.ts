import { describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';
import { makeSelfRecordDto } from '@/tests/msw/attendance-wire.fixture';

import { requestMyAttendance } from '../gateways/attendance-self.gateway';
import { getMyAttendance } from './get-my-attendance.service';

vi.mock('../gateways/attendance-self.gateway', () => ({ requestMyAttendance: vi.fn() }));

describe('getMyAttendance', () => {
  it('maps the wire record into the domain shape', async () => {
    vi.mocked(requestMyAttendance).mockResolvedValue(
      makeSelfRecordDto({ status: 'present_on_time', recordedAt: '2026-07-26T15:05:00.000Z' }),
    );

    const record = await getMyAttendance('team-1', 'sess-1');

    expect(record.status).toBe('present_on_time');
    expect(record.recordedAtIso).toBe('2026-07-26T15:05:00.000Z');
  });

  it('normalizes a transport failure into an AppError', async () => {
    vi.mocked(requestMyAttendance).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Forbidden, message: 'denied' }),
    );

    await expect(getMyAttendance('team-1', 'sess-1')).rejects.toMatchObject({
      code: APP_ERROR_CODE.Forbidden,
    });
  });

  it('passes an already-domain error through untouched', async () => {
    vi.mocked(requestMyAttendance).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Unexpected }),
    );

    await expect(getMyAttendance('team-1', 'sess-1')).rejects.toBeInstanceOf(AppError);
  });
});
