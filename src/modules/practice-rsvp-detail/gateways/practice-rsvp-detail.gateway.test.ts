import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import {
  requestOverrideRsvp,
  requestRsvpHistory,
  requestRsvpParticipants,
  requestRsvpSummary,
} from './practice-rsvp-detail.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const client = { get: vi.fn(), put: vi.fn() };

const PARTICIPANT_DTO = {
  membershipId: 'member-1',
  status: 'going',
  waitlisted: false,
  source: 'self',
  respondedAt: '2026-07-20T09:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  client.get.mockResolvedValue({ items: [PARTICIPANT_DTO], total: 1, limit: 20, offset: 0 });
  client.put.mockResolvedValue({
    sessionId: 's1',
    membershipId: 'member-1',
    status: 'not_going',
    reasonCategory: null,
    note: null,
    noteVisibility: null,
    source: 'coach',
    waitlisted: false,
    respondedAt: '2026-07-22T09:00:00.000Z',
    version: 2,
  });
  vi.mocked(getAppHttpClient).mockReturnValue(client as never);
});

describe('practice-rsvp-detail gateway', () => {
  it('reads the roster with limit, offset, and an omitted status filter', async () => {
    await requestRsvpParticipants({ teamId: 't1', sessionId: 's1', limit: 20, offset: 0, status: null });

    expect(client.get.mock.calls[0]?.[0]).toBe('/teams/t1/practice-sessions/s1/rsvps');
    expect(client.get.mock.calls[0]?.[2]).toEqual({ params: { limit: 20, offset: 0 } });
  });

  it('adds the status filter to the roster read only when one is given', async () => {
    await requestRsvpParticipants({
      teamId: 't1',
      sessionId: 's1',
      limit: 20,
      offset: 0,
      status: 'going',
    });

    expect(client.get.mock.calls[0]?.[2]).toEqual({
      params: { limit: 20, offset: 0, status: 'going' },
    });
  });

  it('reads the session summary from its own route', async () => {
    client.get.mockResolvedValue({
      sessionId: 's1',
      capacity: 20,
      going: 5,
      waitlisted: 0,
      notGoing: 1,
      maybe: 1,
      noResponse: 2,
      spotsRemaining: 15,
    });

    await requestRsvpSummary({ teamId: 't1', sessionId: 's1' });

    expect(client.get.mock.calls[0]?.[0]).toBe('/teams/t1/practice-sessions/s1/rsvps/summary');
  });

  /**
   * The mandatory `reason` always travels; the optional fields are omitted
   * from the body rather than sent as `null` when the coach left them blank.
   */
  it('sends only the fields a coach actually filled in for an override', async () => {
    await requestOverrideRsvp({
      teamId: 't1',
      sessionId: 's1',
      membershipId: 'member-1',
      status: 'not_going',
      reason: 'Reported unavailable through the team chat.',
      reasonCategory: null,
      note: null,
      noteVisibility: null,
      expectedVersion: null,
    });

    expect(client.put.mock.calls[0]?.[0]).toBe('/teams/t1/practice-sessions/s1/rsvps/member-1');
    expect(client.put.mock.calls[0]?.[1]).toEqual({
      status: 'not_going',
      reason: 'Reported unavailable through the team chat.',
    });
  });

  it('includes the optional fields in the override body when they are set', async () => {
    await requestOverrideRsvp({
      teamId: 't1',
      sessionId: 's1',
      membershipId: 'member-1',
      status: 'not_going',
      reason: 'Reported unavailable.',
      reasonCategory: 'work',
      note: 'Out of town',
      noteVisibility: 'coaches',
      expectedVersion: 4,
    });

    expect(client.put.mock.calls[0]?.[1]).toEqual({
      status: 'not_going',
      reason: 'Reported unavailable.',
      reasonCategory: 'work',
      note: 'Out of town',
      noteVisibility: 'coaches',
      expectedVersion: 4,
    });
  });

  it('reads one member history from its own route', async () => {
    client.get.mockResolvedValue({ items: [] });

    await requestRsvpHistory({ teamId: 't1', sessionId: 's1', membershipId: 'member-1' });

    expect(client.get.mock.calls[0]?.[0]).toBe(
      '/teams/t1/practice-sessions/s1/rsvps/member-1/history',
    );
  });

  it('encodes ids so a stray slash cannot escape the path', async () => {
    client.get.mockResolvedValue({ items: [] });

    await requestRsvpParticipants({
      teamId: 't/1',
      sessionId: 's 1',
      limit: 20,
      offset: 0,
      status: null,
    });

    expect(client.get.mock.calls[0]?.[0]).toBe(
      '/teams/t%2F1/practice-sessions/s%201/rsvps',
    );
  });
});
