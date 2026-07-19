import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';
import {
  SAMPLE_RSVP_RESPONSE,
  SAMPLE_SESSION_RESPONSE,
} from '@/tests/msw/practice-session-sample.fixture';

import {
  practiceRsvpResponseSchema,
  practiceSessionListResponseSchema,
  practiceSessionResponseSchema,
} from './practice-session.schema';

const SESSION = SAMPLE_SESSION_RESPONSE;
const RSVP = SAMPLE_RSVP_RESPONSE;

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
