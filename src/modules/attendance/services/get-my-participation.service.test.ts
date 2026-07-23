import { describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import { makeParticipationDto } from '@/tests/msw/attendance-wire.fixture';

import { AppError } from '@/shared/errors/app.errors';

import { requestMyParticipation } from '../gateways/attendance-self.gateway';
import { getMyParticipation } from './get-my-participation.service';

vi.mock('../gateways/attendance-self.gateway', () => ({ requestMyParticipation: vi.fn() }));

describe('getMyParticipation', () => {
  it('projects the summary and forwards the season filter', async () => {
    vi.mocked(requestMyParticipation).mockResolvedValue(makeParticipationDto());

    const summary = await getMyParticipation('team-1', 'season-1');

    expect(requestMyParticipation).toHaveBeenCalledWith('team-1', 'season-1');
    expect(summary.attendanceRatePercent).toBe(90.9);
  });

  it('surfaces the rule-missing 4xx with its message key intact', async () => {
    vi.mocked(requestMyParticipation).mockRejectedValue(
      new HttpError({
        kind: HTTP_ERROR_KIND.Validation,
        message: 'rule missing',
        messageKey: 'errors.practices.attendanceRuleMissing',
      }),
    );

    await expect(getMyParticipation('team-1', null)).rejects.toMatchObject({
      code: APP_ERROR_CODE.Validation,
      messageKey: 'errors.practices.attendanceRuleMissing',
    });
  });

  it('passes an already-domain error through untouched', async () => {
    vi.mocked(requestMyParticipation).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Unexpected }),
    );

    await expect(getMyParticipation('team-1', null)).rejects.toBeInstanceOf(AppError);
  });
});
