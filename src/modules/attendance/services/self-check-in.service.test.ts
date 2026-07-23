import { describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import { makeSelfRecordDto } from '@/tests/msw/attendance-wire.fixture';

import { AppError } from '@/shared/errors/app.errors';

import { requestSelfCheckIn } from '../gateways/attendance-self.gateway';
import { selfCheckIn } from './self-check-in.service';

vi.mock('../gateways/attendance-self.gateway', () => ({ requestSelfCheckIn: vi.fn() }));

describe('selfCheckIn', () => {
  it('returns the server-derived record; the client never picks the status', async () => {
    vi.mocked(requestSelfCheckIn).mockResolvedValue(
      makeSelfRecordDto({ status: 'present_late', latenessMinutes: 7, source: 'self' }),
    );

    const record = await selfCheckIn('team-1', 'sess-1', 'traffic');

    expect(requestSelfCheckIn).toHaveBeenCalledWith('team-1', 'sess-1', 'traffic');
    expect(record.status).toBe('present_late');
    expect(record.latenessMinutes).toBe(7);
  });

  it('maps a 409 window/lock refusal onto the conflict code', async () => {
    vi.mocked(requestSelfCheckIn).mockRejectedValue(
      new HttpError({
        kind: HTTP_ERROR_KIND.Conflict,
        message: 'closed',
        messageKey: 'errors.practices.checkInWindowClosed',
      }),
    );

    await expect(selfCheckIn('team-1', 'sess-1', null)).rejects.toMatchObject({
      code: APP_ERROR_CODE.Conflict,
      messageKey: 'errors.practices.checkInWindowClosed',
    });
  });

  it('passes an already-domain error through untouched', async () => {
    vi.mocked(requestSelfCheckIn).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Unexpected }),
    );

    await expect(selfCheckIn('team-1', 'sess-1', null)).rejects.toBeInstanceOf(AppError);
  });
});
