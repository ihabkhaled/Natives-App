import type { PracticeRsvpContract, PracticeSessionContract } from '@/packages/api-contract';

/**
 * Deterministic, fixed-instant practice session/RSVP wire samples shared by the
 * practice schema and mapper unit tests. Kept in one place so the two suites do
 * not carry byte-identical fixtures (jscpd threshold is zero).
 */
export const SAMPLE_SESSION_RESPONSE: PracticeSessionContract = {
  cancellationReason: null,
  capacity: 24,
  createdAt: '2026-07-18T09:00:00.000Z',
  createdBy: null,
  endsAt: '2026-07-26T17:00:00.000Z',
  field: null,
  id: 'sess-1',
  meetAt: null,
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
};

export const SAMPLE_RSVP_RESPONSE: PracticeRsvpContract = {
  membershipId: 'membership-1',
  sessionId: 'sess-1',
  status: 'going',
  reasonCategory: 'travel',
  note: null,
  noteVisibility: null,
  respondedAt: '2026-07-24T10:00:00.000Z',
  source: 'self',
  version: 2,
  waitlisted: true,
};
