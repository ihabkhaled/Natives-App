import { afterEach, describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';

import { buildPracticeSessionDetailDto } from '../../../../tests/factories/practice.factory';
import { RSVP_STATUS } from '../constants/practice.constants';
import { requestRsvpUpdate } from '../gateways/practice.gateway';
import { submitRsvp } from './submit-rsvp.service';

vi.mock('../gateways/practice.gateway', () => ({ requestRsvpUpdate: vi.fn() }));

const DETAIL = buildPracticeSessionDetailDto({
  rsvp: {
    status: 'going',
    reasonCategory: null,
    respondedAt: '2026-07-24T10:00:00.000Z',
    version: 2,
    waitlisted: false,
    waitlistPosition: null,
    deadlineAt: null,
    canRespond: true,
  },
});

const SUBMISSION = { status: RSVP_STATUS.going, reasonCategory: null, version: 1 } as const;

afterEach(() => {
  vi.clearAllMocks();
});

describe('submitRsvp', () => {
  it('maps the authoritative updated detail', async () => {
    vi.mocked(requestRsvpUpdate).mockResolvedValue(DETAIL);

    const detail = await submitRsvp('sess-1', SUBMISSION);

    expect(detail.rsvp.status).toBe('going');
    expect(detail.rsvp.version).toBe(2);
  });

  it('surfaces a version conflict as a CONFLICT AppError', async () => {
    vi.mocked(requestRsvpUpdate).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Conflict }),
    );

    await expect(submitRsvp('sess-1', SUBMISSION)).rejects.toMatchObject({
      code: APP_ERROR_CODE.Conflict,
    });
  });

  it('normalizes a non-http failure to an unexpected AppError', async () => {
    vi.mocked(requestRsvpUpdate).mockRejectedValue('boom');

    await expect(submitRsvp('sess-1', SUBMISSION)).rejects.toMatchObject({
      code: APP_ERROR_CODE.Unexpected,
    });
  });
});
