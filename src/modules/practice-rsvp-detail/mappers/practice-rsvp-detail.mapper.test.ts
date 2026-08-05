import { describe, expect, it } from 'vitest';

import {
  mapHistory,
  mapParticipantsPage,
  mapRecord,
  mapSummary,
} from './practice-rsvp-detail.mapper';

describe('practice-rsvp-detail mapper', () => {
  it('maps a list page and renames respondedAt to the Iso convention', () => {
    const page = mapParticipantsPage({
      items: [
        {
          membershipId: 'member-1',
          status: 'going',
          waitlisted: false,
          source: 'self',
          respondedAt: '2026-07-20T09:00:00.000Z',
        },
      ],
      total: 1,
      limit: 20,
      offset: 0,
    });

    expect(page).toEqual({
      items: [
        {
          membershipId: 'member-1',
          status: 'going',
          waitlisted: false,
          source: 'self',
          respondedAtIso: '2026-07-20T09:00:00.000Z',
        },
      ],
      total: 1,
      limit: 20,
      offset: 0,
    });
  });

  it('maps the summary straight through', () => {
    const summary = mapSummary({
      sessionId: 's1',
      capacity: 20,
      going: 5,
      waitlisted: 1,
      notGoing: 2,
      maybe: 1,
      noResponse: 3,
      spotsRemaining: 15,
    });

    expect(summary).toEqual({
      sessionId: 's1',
      capacity: 20,
      going: 5,
      waitlisted: 1,
      notGoing: 2,
      maybe: 1,
      noResponse: 3,
      spotsRemaining: 15,
    });
  });

  it('preserves null capacity and spotsRemaining rather than coercing to zero', () => {
    const summary = mapSummary({
      sessionId: 's1',
      capacity: null,
      going: 0,
      waitlisted: 0,
      notGoing: 0,
      maybe: 0,
      noResponse: 0,
      spotsRemaining: null,
    });

    expect(summary.capacity).toBeNull();
    expect(summary.spotsRemaining).toBeNull();
  });

  it('maps the override record and renames respondedAt', () => {
    const record = mapRecord({
      sessionId: 's1',
      membershipId: 'member-1',
      status: 'not_going',
      reasonCategory: 'work',
      note: 'Out of town',
      noteVisibility: 'coaches',
      source: 'coach',
      waitlisted: false,
      respondedAt: '2026-07-22T09:00:00.000Z',
      version: 2,
    });

    expect(record).toEqual({
      sessionId: 's1',
      membershipId: 'member-1',
      status: 'not_going',
      reasonCategory: 'work',
      note: 'Out of town',
      noteVisibility: 'coaches',
      source: 'coach',
      waitlisted: false,
      respondedAtIso: '2026-07-22T09:00:00.000Z',
      version: 2,
    });
  });

  it('maps a full revision trail and renames occurredAt', () => {
    const history = mapHistory({
      items: [
        {
          id: 'rev-1',
          membershipId: 'member-1',
          fromStatus: 'no_response',
          toStatus: 'not_going',
          reasonCategory: 'work',
          note: null,
          waitlisted: false,
          source: 'coach',
          isOverride: true,
          overrideReason: 'Reported unavailable.',
          actorUserId: 'coach-1',
          occurredAt: '2026-07-21T08:00:00.000Z',
        },
      ],
    });

    expect(history.items).toEqual([
      {
        id: 'rev-1',
        membershipId: 'member-1',
        fromStatus: 'no_response',
        toStatus: 'not_going',
        reasonCategory: 'work',
        note: null,
        waitlisted: false,
        source: 'coach',
        isOverride: true,
        overrideReason: 'Reported unavailable.',
        actorUserId: 'coach-1',
        occurredAtIso: '2026-07-21T08:00:00.000Z',
      },
    ]);
  });

  it('maps an empty history to an empty list', () => {
    expect(mapHistory({ items: [] })).toEqual({ items: [] });
  });
});
