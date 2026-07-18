import { afterEach, describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';

import { buildPracticeRsvpDto } from '../../../../tests/factories/practice.factory';
import { RSVP_STATUS } from '../constants/practice.constants';
import { requestRsvpUpdate } from '../gateways/practice.gateway';
import { submitRsvp } from './submit-rsvp.service';

vi.mock('../gateways/practice.gateway', () => ({ requestRsvpUpdate: vi.fn() }));

const SUBMISSION = { status: RSVP_STATUS.going, reasonCategory: null, version: 1 } as const;

afterEach(() => {
  vi.clearAllMocks();
});

describe('submitRsvp', () => {
  it('maps the authoritative updated RSVP resource', async () => {
    vi.mocked(requestRsvpUpdate).mockResolvedValue(
      buildPracticeRsvpDto({ status: 'going', version: 2 }),
    );

    const update = await submitRsvp('team-1', 'sess-1', SUBMISSION);

    expect(requestRsvpUpdate).toHaveBeenCalledWith('team-1', 'sess-1', SUBMISSION);
    expect(update.status).toBe('going');
    expect(update.version).toBe(2);
  });

  it('surfaces a version conflict as a CONFLICT AppError', async () => {
    vi.mocked(requestRsvpUpdate).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Conflict }),
    );

    await expect(submitRsvp('team-1', 'sess-1', SUBMISSION)).rejects.toMatchObject({
      code: APP_ERROR_CODE.Conflict,
    });
  });

  it('normalizes a non-http failure to an unexpected AppError', async () => {
    vi.mocked(requestRsvpUpdate).mockRejectedValue('boom');

    await expect(submitRsvp('team-1', 'sess-1', SUBMISSION)).rejects.toMatchObject({
      code: APP_ERROR_CODE.Unexpected,
    });
  });
});
