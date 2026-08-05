import { describe, expect, it, vi } from 'vitest';

import { practiceRsvpDetailQueryKeys } from './practice-rsvp-detail.keys';
import {
  buildRsvpHistoryQueryOptions,
  buildRsvpParticipantsQueryOptions,
  buildRsvpSummaryQueryOptions,
} from './practice-rsvp-detail.query';

vi.mock('../services/list-rsvp-participants.service', () => ({
  listRsvpParticipants: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 }),
}));
vi.mock('../services/get-rsvp-summary.service', () => ({
  getRsvpSummary: vi.fn().mockResolvedValue({}),
}));
vi.mock('../services/get-rsvp-history.service', () => ({
  getRsvpHistory: vi.fn().mockResolvedValue({ items: [] }),
}));

const PARAMS = { teamId: 't1', sessionId: 's1' };

describe('buildRsvpParticipantsQueryOptions', () => {
  it('keys the read by team, session, limit, and status', () => {
    expect(buildRsvpParticipantsQueryOptions(PARAMS, 20, '').queryKey).toEqual(
      practiceRsvpDetailQueryKeys.participants('t1', 's1', 20, ''),
    );
  });

  it('omits the status filter from the read when none is chosen', async () => {
    const { listRsvpParticipants } = await import('../services/list-rsvp-participants.service');
    await buildRsvpParticipantsQueryOptions(PARAMS, 20, '').queryFn();

    expect(listRsvpParticipants).toHaveBeenCalledWith({
      teamId: 't1',
      sessionId: 's1',
      limit: 20,
      offset: 0,
      status: null,
    });
  });

  it('carries a chosen status filter into the read', async () => {
    const { listRsvpParticipants } = await import('../services/list-rsvp-participants.service');
    await buildRsvpParticipantsQueryOptions(PARAMS, 20, 'going').queryFn();

    expect(listRsvpParticipants).toHaveBeenCalledWith({
      teamId: 't1',
      sessionId: 's1',
      limit: 20,
      offset: 0,
      status: 'going',
    });
  });

  it('disables the read for an unresolved session id', () => {
    expect(buildRsvpParticipantsQueryOptions({ teamId: 't1', sessionId: '' }, 20, '').enabled).toBe(
      false,
    );
  });
});

describe('buildRsvpSummaryQueryOptions', () => {
  it('keys the read by team and session', () => {
    expect(buildRsvpSummaryQueryOptions(PARAMS).queryKey).toEqual(
      practiceRsvpDetailQueryKeys.summary('t1', 's1'),
    );
  });

  it('reads the summary for the given session', async () => {
    const { getRsvpSummary } = await import('../services/get-rsvp-summary.service');
    await buildRsvpSummaryQueryOptions(PARAMS).queryFn();

    expect(getRsvpSummary).toHaveBeenCalledWith(PARAMS);
  });
});

describe('buildRsvpHistoryQueryOptions', () => {
  it('keys the read by team, session, and membership id', () => {
    expect(buildRsvpHistoryQueryOptions(PARAMS, 'member-1').queryKey).toEqual(
      practiceRsvpDetailQueryKeys.history('t1', 's1', 'member-1'),
    );
  });

  it('reads one member\'s history', async () => {
    const { getRsvpHistory } = await import('../services/get-rsvp-history.service');
    await buildRsvpHistoryQueryOptions(PARAMS, 'member-1').queryFn();

    expect(getRsvpHistory).toHaveBeenCalledWith({ ...PARAMS, membershipId: 'member-1' });
  });

  it('disables the read without a chosen membership id', () => {
    expect(buildRsvpHistoryQueryOptions(PARAMS, '').enabled).toBe(false);
  });
});
