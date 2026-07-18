import { afterEach, describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';

import {
  buildPracticeRsvpDto,
  buildPracticeSessionDto,
} from '../../../../tests/factories/practice.factory';
import { requestPracticeRsvp, requestPracticeSession } from '../gateways/practice.gateway';
import { getPracticeSession } from './get-practice-session.service';

vi.mock('../gateways/practice.gateway', () => ({
  requestPracticeRsvp: vi.fn(),
  requestPracticeSession: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('getPracticeSession', () => {
  it('combines the exact session and self-RSVP resources', async () => {
    vi.mocked(requestPracticeSession).mockResolvedValue(buildPracticeSessionDto());
    vi.mocked(requestPracticeRsvp).mockResolvedValue(buildPracticeRsvpDto());

    const detail = await getPracticeSession('team-1', 'sess-1');

    expect(requestPracticeSession).toHaveBeenCalledWith('team-1', 'sess-1');
    expect(requestPracticeRsvp).toHaveBeenCalledWith('team-1', 'sess-1');
    expect(detail.id).toBe('sess-1');
  });

  it('maps a not-found failure to an AppError', async () => {
    vi.mocked(requestPracticeSession).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.NotFound }),
    );

    await expect(getPracticeSession('team-1', 'missing')).rejects.toMatchObject({
      code: APP_ERROR_CODE.NotFound,
    });
  });

  it('normalizes a non-http failure to an unexpected AppError', async () => {
    vi.mocked(requestPracticeSession).mockRejectedValue('boom');

    await expect(getPracticeSession('team-1', 'sess-1')).rejects.toMatchObject({
      code: APP_ERROR_CODE.Unexpected,
    });
  });
});
