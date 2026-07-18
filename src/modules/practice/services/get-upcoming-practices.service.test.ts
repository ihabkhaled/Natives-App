import { afterEach, describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';

import {
  buildPracticeRsvpDto,
  buildPracticeSessionDto,
} from '../../../../tests/factories/practice.factory';
import { requestPracticeRsvp, requestPracticeSessions } from '../gateways/practice.gateway';
import { getUpcomingPractices } from './get-upcoming-practices.service';

vi.mock('../gateways/practice.gateway', () => ({
  requestPracticeRsvp: vi.fn(),
  requestPracticeSessions: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('getUpcomingPractices', () => {
  it('uses the canonical list endpoint with a bounded from window', async () => {
    vi.mocked(requestPracticeSessions).mockResolvedValue({
      items: [buildPracticeSessionDto()],
      limit: 5,
      offset: 0,
      total: 1,
    });
    vi.mocked(requestPracticeRsvp).mockResolvedValue(buildPracticeRsvpDto());

    const sessions = await getUpcomingPractices('team-1', '2026-07-18T12:00:00.000Z');

    expect(requestPracticeSessions).toHaveBeenCalledWith({
      teamId: 'team-1',
      from: '2026-07-18T12:00:00.000Z',
      to: null,
      sessionType: null,
      limit: 5,
      offset: 0,
    });
    expect(sessions).toHaveLength(1);
  });

  it('maps a transport failure to an AppError', async () => {
    vi.mocked(requestPracticeSessions).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Server }),
    );

    await expect(getUpcomingPractices('team-1')).rejects.toMatchObject({
      code: APP_ERROR_CODE.Server,
    });
  });

  it('normalizes a non-http failure to an unexpected AppError', async () => {
    vi.mocked(requestPracticeSessions).mockRejectedValue(new Error('boom'));

    await expect(getUpcomingPractices('team-1')).rejects.toMatchObject({
      code: APP_ERROR_CODE.Unexpected,
    });
  });
});
