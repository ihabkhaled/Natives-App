import { afterEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import { RSVP_STATUS } from '../constants/practice.constants';
import {
  requestPracticeRsvp,
  requestPracticeSession,
  requestPracticeSessions,
  requestRsvpUpdate,
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
  it('uses the team-scoped backend route and exact supported query fields', async () => {
    await requestPracticeSessions({
      teamId: 'team/one',
      from: '2026-07-18T00:00:00.000Z',
      to: null,
      sessionType: 'practice',
      limit: 20,
      offset: 0,
    });

    const [path, , options] = get.mock.calls[0] as [string, unknown, { params: object }];
    expect(path).toBe('/teams/team%2Fone/practice-sessions');
    expect(options.params).toEqual({
      from: '2026-07-18T00:00:00.000Z',
      sessionType: 'practice',
      limit: 20,
      offset: 0,
    });
  });

  it('omits nullable filters the backend contract does not receive', async () => {
    await requestPracticeSessions({
      teamId: 'team-1',
      from: null,
      to: null,
      sessionType: null,
      limit: 40,
      offset: 20,
    });

    const options = (
      get.mock.calls[0] as [string, unknown, { params: Record<string, unknown> }]
    )[2];
    expect(options.params).toEqual({ limit: 40, offset: 20 });
  });

  it('includes the supported upper date boundary', async () => {
    await requestPracticeSessions({
      teamId: 'team-1',
      from: null,
      to: '2026-07-18T00:00:00.000Z',
      sessionType: null,
      limit: 20,
      offset: 0,
    });

    const options = (
      get.mock.calls[0] as [string, unknown, { params: Record<string, unknown> }]
    )[2];
    expect(options.params).toEqual({
      to: '2026-07-18T00:00:00.000Z',
      limit: 20,
      offset: 0,
    });
  });
});

describe('requestPracticeSession', () => {
  it('hits the team-scoped detail endpoint', async () => {
    await requestPracticeSession('team-1', 'sess/7');

    expect(get.mock.calls[0]?.[0]).toBe('/teams/team-1/practice-sessions/sess%2F7');
  });
});

describe('requestPracticeRsvp', () => {
  it('loads the member RSVP from the canonical endpoint', async () => {
    await requestPracticeRsvp('team-1', 'sess-7');

    expect(get.mock.calls[0]?.[0]).toBe('/teams/team-1/practice-sessions/sess-7/rsvp');
  });
});

describe('requestRsvpUpdate', () => {
  it('maps the app submission to SetRsvpDto', async () => {
    const submission = { status: RSVP_STATUS.going, reasonCategory: null, version: 3 };
    await requestRsvpUpdate('team-1', 'sess-7', submission);

    const [path, body] = put.mock.calls[0] as [string, unknown];
    expect(path).toBe('/teams/team-1/practice-sessions/sess-7/rsvp');
    expect(body).toEqual({ status: 'going', expectedVersion: 3 });
  });

  it('includes optional reason and omits a missing version', async () => {
    await requestRsvpUpdate('team-1', 'sess-7', {
      status: RSVP_STATUS.notGoing,
      reasonCategory: 'work',
      version: null,
    });

    const body = (put.mock.calls[0] as [string, unknown])[1];
    expect(body).toEqual({ status: 'not_going', reasonCategory: 'work' });
  });
});
