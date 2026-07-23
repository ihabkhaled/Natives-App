import { describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';
import { makeSelfHistoryDto } from '@/tests/msw/attendance-wire.fixture';

import { requestMyAttendanceHistory } from '../gateways/attendance-self.gateway';
import { getMyAttendanceHistory } from './get-my-attendance-history.service';

vi.mock('../gateways/attendance-self.gateway', () => ({ requestMyAttendanceHistory: vi.fn() }));

describe('getMyAttendanceHistory', () => {
  it('maps the wire page into the domain shape', async () => {
    vi.mocked(requestMyAttendanceHistory).mockResolvedValue(makeSelfHistoryDto({ total: 25 }));

    const page = await getMyAttendanceHistory('team-1', 20);

    expect(requestMyAttendanceHistory).toHaveBeenCalledWith('team-1', 20);
    expect(page.total).toBe(25);
    expect(page.items[0]?.startsAtIso).toBe('2026-07-19T15:00:00.000Z');
  });

  it('normalizes a transport failure into an AppError', async () => {
    vi.mocked(requestMyAttendanceHistory).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Forbidden, message: 'denied' }),
    );

    await expect(getMyAttendanceHistory('team-1', 20)).rejects.toMatchObject({
      code: APP_ERROR_CODE.Forbidden,
    });
  });

  it('passes an already-domain error through untouched', async () => {
    vi.mocked(requestMyAttendanceHistory).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Unexpected }),
    );

    await expect(getMyAttendanceHistory('team-1', 20)).rejects.toBeInstanceOf(AppError);
  });
});
