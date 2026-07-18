import { afterEach, describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';

import { requestUpcomingPractices } from '../gateways/practice.gateway';
import { getUpcomingPractices } from './get-upcoming-practices.service';

vi.mock('../gateways/practice.gateway', () => ({ requestUpcomingPractices: vi.fn() }));

const SUMMARY = {
  id: 'sess-1',
  type: 'practice',
  title: null,
  status: 'scheduled',
  startAt: '2026-07-26T15:00:00.000Z',
  endAt: '2026-07-26T17:00:00.000Z',
  meetAt: null,
  rsvpDeadlineAt: null,
  venueName: null,
  capacity: null,
  myRsvpStatus: 'no_response',
  waitlisted: false,
  changeKind: null,
} as const;

afterEach(() => {
  vi.clearAllMocks();
});

describe('getUpcomingPractices', () => {
  it('maps the bounded upcoming list', async () => {
    vi.mocked(requestUpcomingPractices).mockResolvedValue({ items: [SUMMARY] });

    const sessions = await getUpcomingPractices();

    expect(sessions).toHaveLength(1);
    expect(sessions[0]?.id).toBe('sess-1');
  });

  it('maps a transport failure to an AppError', async () => {
    vi.mocked(requestUpcomingPractices).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Server }),
    );

    await expect(getUpcomingPractices()).rejects.toMatchObject({ code: APP_ERROR_CODE.Server });
  });

  it('normalizes a non-http failure to an unexpected AppError', async () => {
    vi.mocked(requestUpcomingPractices).mockRejectedValue(new Error('boom'));

    await expect(getUpcomingPractices()).rejects.toMatchObject({
      code: APP_ERROR_CODE.Unexpected,
    });
  });
});
