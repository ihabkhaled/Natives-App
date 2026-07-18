import {
  PRACTICE_CHANGE_KIND,
  PRACTICE_STATUS,
  PRACTICE_TYPE,
  RSVP_STATUS,
  type practiceSessionDetailSchema,
} from '@/modules/practice';
import type { SchemaOutput } from '@/packages/schema';
import { I18N_KEYS } from '@/shared/i18n';

export type DetailDto = SchemaOutput<typeof practiceSessionDetailSchema>;
type VenueDto = DetailDto['venue'];
type CountsDto = DetailDto['counts'];

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

function iso(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

const ZAMALEK: VenueDto = {
  id: 'venue-zamalek',
  name: 'Zamalek Club Field',
  addressLine: '26th of July St, Cairo',
  mapUrl: 'https://maps.example.com/?q=zamalek-field',
  notes: 'Enter via Gate 3 and check in at the desk.',
};

const NASR_CITY: VenueDto = {
  id: 'venue-nasr-city',
  name: 'Nasr City Sports Hall',
  addressLine: 'Abbas El Akkad, Cairo',
  mapUrl: null,
  notes: null,
};

const AGENDA: DetailDto['agenda'] = [
  { id: 'agenda-warmup', labelKey: I18N_KEYS.practice.typeRunning, durationMinutes: 15 },
  { id: 'agenda-throwing', labelKey: I18N_KEYS.practice.typeThrowing, durationMinutes: 30 },
  { id: 'agenda-scrimmage', labelKey: I18N_KEYS.practice.typeScrimmage, durationMinutes: null },
];

interface SessionSpec {
  readonly id: string;
  readonly type: DetailDto['type'];
  readonly title: string | null;
  readonly status: DetailDto['status'];
  readonly startDays: number;
  readonly deadlineHours: number;
  readonly venue: VenueDto;
  readonly counts: CountsDto;
  readonly rsvpStatus: DetailDto['rsvp']['status'];
  readonly version: number;
  readonly canRespond: boolean;
  readonly changeKind: DetailDto['changeKind'];
  readonly instructions?: string | null;
  readonly capacity?: number | null;
  readonly agenda?: DetailDto['agenda'];
  readonly meetMinutesBefore?: number | null;
  readonly waitlisted?: boolean;
  readonly waitlistPosition?: number | null;
}

/** Session id whose RSVP write always reports a version conflict. */
export const CONFLICT_SESSION_ID = 'sess-conflict';

const SESSION_SPECS: readonly SessionSpec[] = [
  {
    id: 'sess-evening',
    type: PRACTICE_TYPE.practice,
    title: 'Evening practice',
    status: PRACTICE_STATUS.scheduled,
    startDays: 2,
    deadlineHours: 24,
    venue: ZAMALEK,
    counts: { going: 12, maybe: 3, notGoing: 2, waitlist: 0 },
    rsvpStatus: RSVP_STATUS.noResponse,
    version: 1,
    canRespond: true,
    changeKind: null,
    instructions: 'Bring both light and dark jerseys.',
    capacity: 24,
    agenda: AGENDA,
    meetMinutesBefore: 30,
  },
  {
    id: 'sess-scrimmage',
    type: PRACTICE_TYPE.scrimmage,
    title: 'Weekend scrimmage',
    status: PRACTICE_STATUS.rescheduled,
    startDays: 6,
    deadlineHours: 120,
    venue: ZAMALEK,
    counts: { going: 20, maybe: 1, notGoing: 0, waitlist: 2 },
    rsvpStatus: RSVP_STATUS.going,
    version: 3,
    canRespond: true,
    changeKind: PRACTICE_CHANGE_KIND.rescheduled,
    capacity: 20,
    waitlisted: true,
    waitlistPosition: 2,
  },
  {
    id: 'sess-throwing',
    type: PRACTICE_TYPE.throwing,
    title: 'Throwing clinic',
    status: PRACTICE_STATUS.scheduled,
    startDays: 1,
    deadlineHours: -2,
    venue: NASR_CITY,
    counts: { going: 8, maybe: 0, notGoing: 1, waitlist: 0 },
    rsvpStatus: RSVP_STATUS.noResponse,
    version: 1,
    canRespond: false,
    changeKind: null,
  },
  {
    id: 'sess-cancelled',
    type: PRACTICE_TYPE.game,
    title: 'League game',
    status: PRACTICE_STATUS.cancelled,
    startDays: 3,
    deadlineHours: 48,
    venue: ZAMALEK,
    counts: null,
    rsvpStatus: RSVP_STATUS.going,
    version: 4,
    canRespond: false,
    changeKind: PRACTICE_CHANGE_KIND.cancelled,
  },
  {
    id: CONFLICT_SESSION_ID,
    type: PRACTICE_TYPE.practice,
    title: 'Concurrent practice',
    status: PRACTICE_STATUS.scheduled,
    startDays: 5,
    deadlineHours: 96,
    venue: NASR_CITY,
    counts: { going: 5, maybe: 0, notGoing: 0, waitlist: 0 },
    rsvpStatus: RSVP_STATUS.noResponse,
    version: 1,
    canRespond: true,
    changeKind: null,
  },
  {
    id: 'sess-past',
    type: PRACTICE_TYPE.practice,
    title: 'Last week practice',
    status: PRACTICE_STATUS.scheduled,
    startDays: -5,
    deadlineHours: -144,
    venue: ZAMALEK,
    counts: { going: 15, maybe: 0, notGoing: 3, waitlist: 0 },
    rsvpStatus: RSVP_STATUS.going,
    version: 2,
    canRespond: false,
    changeKind: null,
  },
];

function meetAtIso(startMs: number, spec: SessionSpec): string | null {
  const before = spec.meetMinutesBefore ?? null;
  return before === null ? null : iso(startMs - before * 60_000);
}

function makeDetail(spec: SessionSpec): DetailDto {
  const startMs = spec.startDays * DAY_MS;
  const deadlineAt = iso(spec.deadlineHours * HOUR_MS);
  const answered = spec.rsvpStatus !== RSVP_STATUS.noResponse;
  return {
    id: spec.id,
    type: spec.type,
    title: spec.title,
    status: spec.status,
    startAt: iso(startMs),
    endAt: iso(startMs + 2 * HOUR_MS),
    meetAt: meetAtIso(startMs, spec),
    rsvpDeadlineAt: deadlineAt,
    venue: spec.venue,
    instructions: spec.instructions ?? null,
    capacity: spec.capacity ?? null,
    counts: spec.counts,
    agenda: spec.agenda ?? [],
    rsvp: {
      status: spec.rsvpStatus,
      reasonCategory: null,
      respondedAt: answered ? iso(-DAY_MS) : null,
      version: spec.version,
      waitlisted: spec.waitlisted ?? false,
      waitlistPosition: spec.waitlistPosition ?? null,
      deadlineAt,
      canRespond: spec.canRespond,
    },
    changeKind: spec.changeKind,
    updatedAt: iso(-HOUR_MS),
  };
}

/** Fresh, deterministic session details with instants relative to now. */
export function buildInitialSessions(): DetailDto[] {
  return SESSION_SPECS.map(makeDetail);
}
