import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';

import {
  practiceRsvpResponseSchema,
  practiceSessionListResponseSchema,
  practiceSessionResponseSchema,
} from './practice-session.schema';

const SESSION = {
  cancellationReason: null,
  capacity: 24,
  createdAt: '2026-07-18T09:00:00.000Z',
  createdBy: null,
  endsAt: '2026-07-26T17:00:00.000Z',
  field: null,
  id: 'sess-1',
  meetAt: '2026-07-26T14:30:00.000Z',
  notes: null,
  occurrenceDate: '2026-07-26',
  organizerUserId: null,
  rsvpCutoffAt: '2026-07-25T12:00:00.000Z',
  scheduleId: null,
  seasonId: 'season-1',
  sessionType: 'practice',
  startsAt: '2026-07-26T15:00:00.000Z',
  status: 'published',
  teamId: 'team-1',
  timezone: 'Africa/Cairo',
  updatedAt: '2026-07-18T09:00:00.000Z',
  updatedBy: null,
  venueId: null,
  version: 2,
  visibility: 'team',
} as const;

const RSVP = {
  membershipId: 'membership-1',
  sessionId: 'sess-1',
  status: 'going',
  reasonCategory: 'travel',
  note: null,
  noteVisibility: null,
  respondedAt: '2026-07-24T10:00:00.000Z',
  source: 'self',
  version: 2,
  waitlisted: false,
} as const;

describe('practiceSessionResponseSchema', () => {
  it('accepts the exact SessionResponseDto shape', () => {
    expect(safeParseWithSchema(practiceSessionResponseSchema, SESSION).success).toBe(true);
  });

  it('rejects an invented frontend status', () => {
    expect(
      safeParseWithSchema(practiceSessionResponseSchema, {
        ...SESSION,
        status: 'scheduled',
      }).success,
    ).toBe(false);
  });

  it('rejects a non-ISO session instant', () => {
    expect(
      safeParseWithSchema(practiceSessionResponseSchema, {
        ...SESSION,
        startsAt: 'tomorrow',
      }).success,
    ).toBe(false);
  });
});

describe('practiceSessionListResponseSchema', () => {
  it('accepts the exact offset-based list envelope', () => {
    expect(
      safeParseWithSchema(practiceSessionListResponseSchema, {
        items: [SESSION],
        limit: 20,
        offset: 0,
        total: 1,
      }).success,
    ).toBe(true);
  });

  it('rejects the old invented page envelope', () => {
    expect(
      safeParseWithSchema(practiceSessionListResponseSchema, {
        items: [SESSION],
        page: 1,
        pageSize: 20,
        total: 1,
        hasMore: false,
      }).success,
    ).toBe(false);
  });
});

describe('practiceRsvpResponseSchema', () => {
  it('accepts the exact RsvpResponseDto shape', () => {
    expect(safeParseWithSchema(practiceRsvpResponseSchema, RSVP).success).toBe(true);
  });

  it('accepts nullable version and response metadata', () => {
    expect(
      safeParseWithSchema(practiceRsvpResponseSchema, {
        ...RSVP,
        reasonCategory: null,
        respondedAt: null,
        source: null,
        version: null,
      }).success,
    ).toBe(true);
  });

  it('rejects an unknown RSVP status', () => {
    expect(
      safeParseWithSchema(practiceRsvpResponseSchema, {
        ...RSVP,
        status: 'perhaps',
      }).success,
    ).toBe(false);
  });
});
