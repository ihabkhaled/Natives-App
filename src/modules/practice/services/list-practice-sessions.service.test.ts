import { afterEach, describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { PRACTICE_SCOPE } from '../constants/practice.constants';
import { requestPracticeSessions } from '../gateways/practice.gateway';
import type { practiceSessionListResponseSchema } from '../schemas/practice-session.schema';
import { listPracticeSessions } from './list-practice-sessions.service';

type ListDto = SchemaOutput<typeof practiceSessionListResponseSchema>;

vi.mock('../gateways/practice.gateway', () => ({ requestPracticeSessions: vi.fn() }));

const PARAMS = {
  scope: PRACTICE_SCOPE.upcoming,
  type: null,
  rsvp: null,
  pageSize: 20,
} as const;

const LIST_DTO: ListDto = {
  items: [
    {
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
    },
  ],
  page: 1,
  pageSize: 20,
  total: 1,
  hasMore: false,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('listPracticeSessions', () => {
  it('maps a successful page to the domain', async () => {
    vi.mocked(requestPracticeSessions).mockResolvedValue(LIST_DTO);

    const page = await listPracticeSessions(PARAMS);

    expect(page.items[0]?.startAtIso).toBe('2026-07-26T15:00:00.000Z');
  });

  it('maps a transport failure to an AppError', async () => {
    vi.mocked(requestPracticeSessions).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Forbidden }),
    );

    await expect(listPracticeSessions(PARAMS)).rejects.toMatchObject({
      code: APP_ERROR_CODE.Forbidden,
    });
  });

  it('normalizes a non-http failure to an unexpected AppError', async () => {
    vi.mocked(requestPracticeSessions).mockRejectedValue(new Error('boom'));

    await expect(listPracticeSessions(PARAMS)).rejects.toBeInstanceOf(AppError);
  });
});
