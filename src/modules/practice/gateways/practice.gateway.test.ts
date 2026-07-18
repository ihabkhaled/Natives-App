import { afterEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import { PRACTICE_SCOPE, PRACTICE_TYPE, RSVP_STATUS } from '../constants/practice.constants';
import {
  requestPracticeSession,
  requestPracticeSessions,
  requestRsvpUpdate,
  requestUpcomingPractices,
} from './practice.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const get = vi.fn().mockResolvedValue({});
const put = vi.fn().mockResolvedValue({});

vi.mocked(getAppHttpClient).mockReturnValue({ get, put } as never);

afterEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAppHttpClient).mockReturnValue({ get, put } as never);
});

describe('requestPracticeSessions', () => {
  it('sends the scope, page size, and set filters only', async () => {
    await requestPracticeSessions({
      scope: PRACTICE_SCOPE.upcoming,
      type: PRACTICE_TYPE.practice,
      rsvp: null,
      pageSize: 20,
    });

    const [path, , options] = get.mock.calls[0] as [string, unknown, { params: object }];
    expect(path).toBe('/practices/sessions');
    expect(options.params).toEqual({ scope: 'upcoming', pageSize: 20, type: 'practice' });
  });

  it('includes the rsvp filter when present', async () => {
    await requestPracticeSessions({
      scope: PRACTICE_SCOPE.all,
      type: null,
      rsvp: RSVP_STATUS.going,
      pageSize: 40,
    });

    const options = (
      get.mock.calls[0] as [string, unknown, { params: Record<string, unknown> }]
    )[2];
    expect(options.params).toEqual({ scope: 'all', pageSize: 40, rsvp: 'going' });
  });
});

describe('requestUpcomingPractices', () => {
  it('hits the upcoming endpoint', async () => {
    await requestUpcomingPractices();

    expect(get.mock.calls[0]?.[0]).toBe('/practices/sessions/upcoming');
  });
});

describe('requestPracticeSession', () => {
  it('hits the detail endpoint for the id', async () => {
    await requestPracticeSession('sess-7');

    expect(get.mock.calls[0]?.[0]).toBe('/practices/sessions/sess-7');
  });
});

describe('requestRsvpUpdate', () => {
  it('puts the submission to the rsvp endpoint', async () => {
    const submission = { status: RSVP_STATUS.going, reasonCategory: null, version: 3 };
    await requestRsvpUpdate('sess-7', submission);

    const [path, body] = put.mock.calls[0] as [string, unknown];
    expect(path).toBe('/practices/sessions/sess-7/rsvp');
    expect(body).toEqual(submission);
  });
});
