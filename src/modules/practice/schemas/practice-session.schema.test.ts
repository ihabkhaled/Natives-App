import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';

import {
  practiceSessionDetailSchema,
  practiceSessionListResponseSchema,
  upcomingPracticesResponseSchema,
} from './practice-session.schema';

const SUMMARY = {
  id: 'sess-1',
  type: 'practice',
  title: 'Evening practice',
  status: 'scheduled',
  startAt: '2026-07-26T15:00:00.000Z',
  endAt: '2026-07-26T17:00:00.000Z',
  meetAt: null,
  rsvpDeadlineAt: '2026-07-25T12:00:00.000Z',
  venueName: 'Zamalek Club Field',
  capacity: 24,
  myRsvpStatus: 'no_response',
  waitlisted: false,
  changeKind: null,
} as const;

const DETAIL = {
  id: 'sess-1',
  type: 'practice',
  title: null,
  status: 'rescheduled',
  startAt: '2026-07-26T15:00:00.000Z',
  endAt: '2026-07-26T17:00:00.000Z',
  meetAt: '2026-07-26T14:30:00.000Z',
  rsvpDeadlineAt: '2026-07-25T12:00:00.000Z',
  venue: {
    id: 'venue-1',
    name: 'Zamalek Club Field',
    addressLine: null,
    mapUrl: 'https://maps.example.com/?q=zamalek',
    notes: null,
  },
  instructions: 'Bring both jerseys.',
  capacity: 24,
  counts: { going: 12, maybe: 3, notGoing: 2, waitlist: 0 },
  agenda: [{ id: 'a1', labelKey: 'practice.typeThrowing', durationMinutes: 30 }],
  rsvp: {
    status: 'going',
    reasonCategory: 'travel',
    respondedAt: '2026-07-24T10:00:00.000Z',
    version: 2,
    waitlisted: false,
    waitlistPosition: null,
    deadlineAt: '2026-07-25T12:00:00.000Z',
    canRespond: true,
  },
  changeKind: 'venue_changed',
  updatedAt: '2026-07-24T09:00:00.000Z',
} as const;

describe('practiceSessionListResponseSchema', () => {
  it('accepts a bounded paginated page', () => {
    const result = safeParseWithSchema(practiceSessionListResponseSchema, {
      items: [SUMMARY],
      page: 1,
      pageSize: 20,
      total: 1,
      hasMore: false,
    });

    expect(result.success).toBe(true);
  });

  it('rejects a non-ISO start instant', () => {
    const result = safeParseWithSchema(practiceSessionListResponseSchema, {
      items: [{ ...SUMMARY, startAt: 'yesterday' }],
      page: 1,
      pageSize: 20,
      total: 1,
      hasMore: false,
    });

    expect(result.success).toBe(false);
  });
});

describe('upcomingPracticesResponseSchema', () => {
  it('accepts a bounded upcoming list', () => {
    expect(safeParseWithSchema(upcomingPracticesResponseSchema, { items: [SUMMARY] }).success).toBe(
      true,
    );
  });
});

describe('practiceSessionDetailSchema', () => {
  it('accepts a full detail with nullable projections', () => {
    expect(safeParseWithSchema(practiceSessionDetailSchema, DETAIL).success).toBe(true);
  });

  it('accepts a detail with no venue and no counts', () => {
    const result = safeParseWithSchema(practiceSessionDetailSchema, {
      ...DETAIL,
      venue: null,
      counts: null,
      agenda: [],
    });

    expect(result.success).toBe(true);
  });

  it('rejects a negative RSVP version', () => {
    const result = safeParseWithSchema(practiceSessionDetailSchema, {
      ...DETAIL,
      rsvp: { ...DETAIL.rsvp, version: -1 },
    });

    expect(result.success).toBe(false);
  });

  it('rejects an unknown RSVP status', () => {
    const result = safeParseWithSchema(practiceSessionDetailSchema, {
      ...DETAIL,
      rsvp: { ...DETAIL.rsvp, status: 'perhaps' },
    });

    expect(result.success).toBe(false);
  });

  it('rejects a non-URL map link', () => {
    const result = safeParseWithSchema(practiceSessionDetailSchema, {
      ...DETAIL,
      venue: { ...DETAIL.venue, mapUrl: 'not a url' },
    });

    expect(result.success).toBe(false);
  });
});
