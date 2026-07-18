import {
  PRACTICE_STATUS,
  PRACTICE_TYPE,
  type practiceSessionDetailSchema,
  RSVP_STATUS,
  type PracticeSessionDetail,
  type PracticeSessionListPage,
  type PracticeSessionSummary,
} from '@/modules/practice';
import type { RsvpState } from '@/modules/practice/types/practice.types';
import type { SchemaOutput } from '@/packages/schema';

type PracticeSessionDetailDto = SchemaOutput<typeof practiceSessionDetailSchema>;

/** Synthetic wire-shape session detail (for gateway/service tests). */
export function buildPracticeSessionDetailDto(
  overrides: Partial<PracticeSessionDetailDto> = {},
): PracticeSessionDetailDto {
  return {
    id: 'sess-1',
    type: 'practice',
    title: null,
    status: 'scheduled',
    startAt: '2026-07-26T15:00:00.000Z',
    endAt: '2026-07-26T17:00:00.000Z',
    meetAt: null,
    rsvpDeadlineAt: null,
    venue: null,
    instructions: null,
    capacity: null,
    counts: null,
    agenda: [],
    rsvp: {
      status: 'no_response',
      reasonCategory: null,
      respondedAt: null,
      version: 1,
      waitlisted: false,
      waitlistPosition: null,
      deadlineAt: null,
      canRespond: true,
    },
    changeKind: null,
    updatedAt: '2026-07-24T09:00:00.000Z',
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
