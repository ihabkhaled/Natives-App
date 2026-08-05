import type {
  RsvpParticipant,
  RsvpRecord,
  RsvpRevision,
  RsvpSummary,
} from '@/modules/practice-rsvp-detail';

/** One roster participant: going, answered themselves, not waitlisted. */
export function buildRsvpParticipant(overrides: Partial<RsvpParticipant> = {}): RsvpParticipant {
  return {
    membershipId: 'member-1',
    status: 'going',
    waitlisted: false,
    source: 'self',
    respondedAtIso: '2026-07-20T09:00:00.000Z',
    ...overrides,
  };
}

/** A session with a mix of responses and one seat still open. */
export function buildRsvpSummary(overrides: Partial<RsvpSummary> = {}): RsvpSummary {
  return {
    sessionId: 'session-mock-1',
    capacity: 20,
    going: 12,
    waitlisted: 1,
    notGoing: 3,
    maybe: 2,
    noResponse: 4,
    spotsRemaining: 8,
    ...overrides,
  };
}

/** The record a successful override resolves to. */
export function buildRsvpRecord(overrides: Partial<RsvpRecord> = {}): RsvpRecord {
  return {
    sessionId: 'session-mock-1',
    membershipId: 'member-1',
    status: 'not_going',
    reasonCategory: 'work',
    note: null,
    noteVisibility: null,
    source: 'coach',
    waitlisted: false,
    respondedAtIso: '2026-07-22T09:00:00.000Z',
    version: 2,
    ...overrides,
  };
}

/** One coach override in a member's revision trail. */
export function buildRsvpRevision(overrides: Partial<RsvpRevision> = {}): RsvpRevision {
  return {
    id: 'rev-member-1-1',
    membershipId: 'member-1',
    fromStatus: 'no_response',
    toStatus: 'not_going',
    reasonCategory: 'work',
    note: null,
    waitlisted: false,
    source: 'coach',
    isOverride: true,
    overrideReason: 'Reported unavailable through the team chat.',
    actorUserId: 'coach-mock-1',
    occurredAtIso: '2026-07-21T08:00:00.000Z',
    ...overrides,
  };
}
