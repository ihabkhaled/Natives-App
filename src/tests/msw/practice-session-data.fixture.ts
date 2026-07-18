import type { PracticeRsvpContract, PracticeSessionContract } from '@/packages/api-contract';

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

function iso(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

interface SessionSpec {
  readonly id: string;
  readonly sessionType: string;
  readonly status: PracticeSessionContract['status'];
  readonly startDays: number;
  readonly cutoffHours: number;
  readonly capacity: number | null;
  readonly rsvpStatus: PracticeRsvpContract['status'];
  readonly version: number | null;
  readonly waitlisted?: boolean;
}

export interface PracticeMockRecord {
  readonly session: PracticeSessionContract;
  readonly rsvp: PracticeRsvpContract;
}

/** Session id whose expected-version write reports a conflict. */
export const CONFLICT_SESSION_ID = 'sess-conflict';

const SESSION_SPECS: readonly SessionSpec[] = [
  {
    id: 'sess-evening',
    sessionType: 'practice',
    status: 'published',
    startDays: 2,
    cutoffHours: 24,
    capacity: 24,
    rsvpStatus: 'no_response',
    version: 1,
  },
  {
    id: 'sess-scrimmage',
    sessionType: 'scrimmage',
    status: 'rescheduled',
    startDays: 6,
    cutoffHours: 120,
    capacity: 20,
    rsvpStatus: 'going',
    version: 3,
    waitlisted: true,
  },
  {
    id: 'sess-throwing',
    sessionType: 'throwing',
    status: 'published',
    startDays: 1,
    cutoffHours: -2,
    capacity: null,
    rsvpStatus: 'no_response',
    version: 1,
  },
  {
    id: 'sess-cancelled',
    sessionType: 'game',
    status: 'cancelled',
    startDays: 3,
    cutoffHours: 48,
    capacity: 24,
    rsvpStatus: 'going',
    version: 4,
  },
  {
    id: CONFLICT_SESSION_ID,
    sessionType: 'practice',
    status: 'published',
    startDays: 5,
    cutoffHours: 96,
    capacity: null,
    rsvpStatus: 'no_response',
    version: 2,
  },
  {
    id: 'sess-past',
    sessionType: 'practice',
    status: 'completed',
    startDays: -5,
    cutoffHours: -144,
    capacity: 24,
    rsvpStatus: 'going',
    version: 2,
  },
];

function makeRecord(spec: SessionSpec): PracticeMockRecord {
  const startsAt = iso(spec.startDays * DAY_MS);
  const rsvpCutoffAt = iso(spec.cutoffHours * HOUR_MS);
  const answered = spec.rsvpStatus !== 'no_response';
  return {
    session: {
      cancellationReason: spec.status === 'cancelled' ? 'weather' : null,
      capacity: spec.capacity,
      createdAt: iso(-7 * DAY_MS),
      createdBy: 'user-coach',
      endsAt: iso(spec.startDays * DAY_MS + 2 * HOUR_MS),
      field: null,
      id: spec.id,
      meetAt: iso(spec.startDays * DAY_MS - 30 * 60_000),
      notes: null,
      occurrenceDate: startsAt.slice(0, 10),
      organizerUserId: 'user-coach',
      rsvpCutoffAt,
      scheduleId: null,
      seasonId: 'season-2026-spring',
      sessionType: spec.sessionType,
      startsAt,
      status: spec.status,
      teamId: 'team-natives',
      timezone: 'Africa/Cairo',
      updatedAt: iso(-HOUR_MS),
      updatedBy: 'user-coach',
      venueId: null,
      version: 1,
      visibility: 'team',
    },
    rsvp: {
      membershipId: 'membership-member',
      sessionId: spec.id,
      status: spec.rsvpStatus,
      reasonCategory: null,
      note: null,
      noteVisibility: null,
      respondedAt: answered ? iso(-DAY_MS) : null,
      source: answered ? 'self' : null,
      version: spec.version,
      waitlisted: spec.waitlisted ?? false,
    },
  };
}

/** Fresh, deterministic canonical wire resources with instants relative to now. */
export function buildInitialPracticeRecords(): PracticeMockRecord[] {
  return SESSION_SPECS.map(makeRecord);
}
