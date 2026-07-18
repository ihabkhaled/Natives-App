import { afterEach, describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import {
  buildPracticeRsvpDto,
  buildPracticeSessionDto,
} from '../../../../tests/factories/practice.factory';
import { PRACTICE_SCOPE, PRACTICE_TYPE, RSVP_STATUS } from '../constants/practice.constants';
import { requestPracticeRsvp, requestPracticeSessions } from '../gateways/practice.gateway';
import { listPracticeSessions } from './list-practice-sessions.service';

vi.mock('../gateways/practice.gateway', () => ({
  requestPracticeRsvp: vi.fn(),
  requestPracticeSessions: vi.fn(),
}));

const PARAMS = {
  scope: PRACTICE_SCOPE.upcoming,
  type: PRACTICE_TYPE.practice,
  rsvp: RSVP_STATUS.going,
  pageSize: 20,
} as const;
const SESSION = buildPracticeSessionDto();
const RSVP = buildPracticeRsvpDto({ status: 'going' });

afterEach(() => {
  vi.clearAllMocks();
});

describe('listPracticeSessions', () => {
  it('uses supported backend filters, joins RSVP state, and maps the page', async () => {
    vi.mocked(requestPracticeSessions).mockResolvedValue({
      items: [SESSION],
      limit: 20,
      offset: 0,
      total: 1,
    });
    vi.mocked(requestPracticeRsvp).mockResolvedValue(RSVP);

    const page = await listPracticeSessions('team-1', PARAMS, '2026-07-18T12:00:00.000Z');

    expect(requestPracticeSessions).toHaveBeenCalledWith({
      teamId: 'team-1',
      from: '2026-07-18T12:00:00.000Z',
      to: null,
      sessionType: 'practice',
      limit: 20,
      offset: 0,
    });
    expect(requestPracticeRsvp).toHaveBeenCalledWith('team-1', 'sess-1');
    expect(page.items[0]?.myRsvpStatus).toBe('going');
  });

  it('maps past scope to the supported to query', async () => {
    vi.mocked(requestPracticeSessions).mockResolvedValue({
      items: [],
      limit: 20,
      offset: 0,
      total: 0,
    });

    await listPracticeSessions(
      'team-1',
      { ...PARAMS, scope: PRACTICE_SCOPE.past },
      '2026-07-18T12:00:00.000Z',
    );

    expect(requestPracticeSessions).toHaveBeenCalledWith(
      expect.objectContaining({ from: null, to: '2026-07-18T12:00:00.000Z' }),
    );
  });

  it('maps a transport failure to an AppError', async () => {
    vi.mocked(requestPracticeSessions).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Forbidden }),
    );

    await expect(listPracticeSessions('team-1', PARAMS)).rejects.toMatchObject({
      code: APP_ERROR_CODE.Forbidden,
    });
  });

  it('normalizes a non-http failure to an unexpected AppError', async () => {
    vi.mocked(requestPracticeSessions).mockRejectedValue(new Error('boom'));

    await expect(listPracticeSessions('team-1', PARAMS)).rejects.toBeInstanceOf(AppError);
  });
});
