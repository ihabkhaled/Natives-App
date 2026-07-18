import {
  PRACTICE_STATUS,
  PRACTICE_TYPE,
  type practiceRsvpResponseSchema,
  type practiceSessionResponseSchema,
  RSVP_STATUS,
  type PracticeSessionDetail,
  type PracticeSessionListPage,
  type PracticeSessionSummary,
} from '@/modules/practice';
import type { RsvpState } from '@/modules/practice/types/practice.types';
import type { SchemaOutput } from '@/packages/schema';

type PracticeSessionDto = SchemaOutput<typeof practiceSessionResponseSchema>;
type PracticeRsvpDto = SchemaOutput<typeof practiceRsvpResponseSchema>;

/** Synthetic exact SessionResponseDto (for gateway/service tests). */
export function buildPracticeSessionDto(
  overrides: Partial<PracticeSessionDto> = {},
): PracticeSessionDto {
  return {
    cancellationReason: null,
    capacity: null,
    createdAt: '2026-07-24T09:00:00.000Z',
    createdBy: null,
    endsAt: '2026-07-26T17:00:00.000Z',
    field: null,
    id: 'sess-1',
    meetAt: null,
    notes: null,
    occurrenceDate: '2026-07-26',
    organizerUserId: null,
    rsvpCutoffAt: null,
    scheduleId: null,
    seasonId: 'season-1',
    sessionType: 'practice',
    startsAt: '2026-07-26T15:00:00.000Z',
    status: 'published',
    teamId: 'team-1',
    timezone: 'Africa/Cairo',
    updatedAt: '2026-07-24T09:00:00.000Z',
    updatedBy: null,
    venueId: null,
    version: 1,
    visibility: 'team',
    ...overrides,
  };
}

/** Synthetic exact RsvpResponseDto. */
export function buildPracticeRsvpDto(overrides: Partial<PracticeRsvpDto> = {}): PracticeRsvpDto {
  return {
    membershipId: 'membership-1',
    sessionId: 'sess-1',
    status: 'no_response',
    reasonCategory: null,
    note: null,
    noteVisibility: null,
    respondedAt: null,
    source: null,
    version: 1,
    waitlisted: false,
    ...overrides,
  };
}

/** Synthetic RSVP state; deterministic and offset-free. */
export function buildRsvpState(overrides: Partial<RsvpState> = {}): RsvpState {
  return {
    status: RSVP_STATUS.noResponse,
    reasonCategory: null,
    respondedAtIso: null,
    version: 1,
    waitlisted: false,
    waitlistPosition: null,
    deadlineAtIso: '2026-07-25T12:00:00.000Z',
    canRespond: true,
    ...overrides,
  };
}

/** Synthetic calendar list item. */
export function buildPracticeSessionSummary(
  overrides: Partial<PracticeSessionSummary> = {},
): PracticeSessionSummary {
  return {
    id: 'sess-1',
    type: PRACTICE_TYPE.practice,
    title: 'Evening practice',
    status: PRACTICE_STATUS.scheduled,
    startAtIso: '2026-07-26T15:00:00.000Z',
    endAtIso: '2026-07-26T17:00:00.000Z',
    meetAtIso: null,
    rsvpDeadlineAtIso: '2026-07-25T12:00:00.000Z',
    venueName: 'Zamalek Club Field',
    capacity: 24,
    myRsvpStatus: RSVP_STATUS.noResponse,
    waitlisted: false,
    changeKind: null,
    ...overrides,
  };
}

/** Synthetic full session detail. */
export function buildPracticeSessionDetail(
  overrides: Partial<PracticeSessionDetail> = {},
): PracticeSessionDetail {
  return {
    id: 'sess-1',
    type: PRACTICE_TYPE.practice,
    title: 'Evening practice',
    status: PRACTICE_STATUS.scheduled,
    startAtIso: '2026-07-26T15:00:00.000Z',
    endAtIso: '2026-07-26T17:00:00.000Z',
    meetAtIso: '2026-07-26T14:30:00.000Z',
    rsvpDeadlineAtIso: '2026-07-25T12:00:00.000Z',
    venue: {
      id: 'venue-1',
      name: 'Zamalek Club Field',
      addressLine: '26th of July St, Cairo',
      mapUrl: 'https://maps.example.com/?q=zamalek',
      notes: 'Enter via Gate 3.',
    },
    instructions: 'Bring both jerseys.',
    capacity: 24,
    counts: { going: 12, maybe: 3, notGoing: 2, waitlist: 0 },
    agenda: [{ id: 'a1', labelKey: 'practice.typeThrowing', durationMinutes: 30 }],
    rsvp: buildRsvpState(),
    changeKind: null,
    updatedAtIso: '2026-07-24T09:00:00.000Z',
    ...overrides,
  };
}

/** Synthetic bounded list page. */
export function buildPracticeSessionListPage(
  overrides: Partial<PracticeSessionListPage> = {},
): PracticeSessionListPage {
  return {
    items: [buildPracticeSessionSummary()],
    page: 1,
    pageSize: 20,
    total: 1,
    hasMore: false,
    ...overrides,
  };
}
