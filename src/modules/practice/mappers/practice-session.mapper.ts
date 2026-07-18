import type { SchemaOutput } from '@/packages/schema';

import {
  PRACTICE_CHANGE_KIND,
  PRACTICE_STATUS,
  PRACTICE_TYPE,
  type PracticeChangeKind,
  type PracticeStatus,
  type PracticeType,
  type RsvpStatus,
} from '../constants/practice.constants';
import type {
  practiceRsvpResponseSchema,
  practiceSessionListResponseSchema,
  practiceSessionResponseSchema,
} from '../schemas/practice-session.schema';
import type {
  PracticeSessionDetail,
  PracticeSessionListPage,
  PracticeSessionSummary,
  RsvpState,
  RsvpUpdate,
} from '../types/practice.types';

type SessionDto = SchemaOutput<typeof practiceSessionResponseSchema>;
type ListDto = SchemaOutput<typeof practiceSessionListResponseSchema>;
type RsvpDto = SchemaOutput<typeof practiceRsvpResponseSchema>;

function mapPracticeType(sessionType: string): PracticeType {
  const knownType = Object.values(PRACTICE_TYPE).find((value) => value === sessionType);
  return knownType ?? PRACTICE_TYPE.custom;
}

function mapPracticeStatus(status: SessionDto['status']): PracticeStatus {
  if (status === 'rescheduled') {
    return PRACTICE_STATUS.rescheduled;
  }
  if (status === 'cancelled') {
    return PRACTICE_STATUS.cancelled;
  }
  return PRACTICE_STATUS.scheduled;
}

function mapChangeKind(status: SessionDto['status']): PracticeChangeKind | null {
  if (status === 'rescheduled') {
    return PRACTICE_CHANGE_KIND.rescheduled;
  }
  if (status === 'cancelled') {
    return PRACTICE_CHANGE_KIND.cancelled;
  }
  return null;
}

/** Exact RSVP DTO translated into the app's UI state. */
export function mapRsvpState(
  dto: RsvpDto,
  deadlineAtIso: string | null,
  canRespond: boolean,
): RsvpState {
  return {
    status: dto.status,
    reasonCategory: dto.reasonCategory,
    respondedAtIso: dto.respondedAt,
    version: dto.version,
    waitlisted: dto.waitlisted,
    waitlistPosition: null,
    deadlineAtIso,
    canRespond,
  };
}

/** Exact RSVP mutation result translated without inventing session projections. */
export function mapRsvpUpdate(dto: RsvpDto): RsvpUpdate {
  return {
    status: dto.status,
    reasonCategory: dto.reasonCategory,
    respondedAtIso: dto.respondedAt,
    version: dto.version,
    waitlisted: dto.waitlisted,
  };
}

/** Exact session + RSVP resources projected into one calendar card. */
export function mapPracticeSessionSummary(
  session: SessionDto,
  rsvp: RsvpDto,
): PracticeSessionSummary {
  return {
    id: session.id,
    type: mapPracticeType(session.sessionType),
    title: null,
    status: mapPracticeStatus(session.status),
    startAtIso: session.startsAt,
    endAtIso: session.endsAt,
    meetAtIso: session.meetAt,
    rsvpDeadlineAtIso: session.rsvpCutoffAt,
    venueName: null,
    capacity: session.capacity,
    myRsvpStatus: rsvp.status,
    waitlisted: rsvp.waitlisted,
    changeKind: mapChangeKind(session.status),
  };
}

/** Exact offset page translated into the app's pagination vocabulary. */
export function mapPracticeSessionListPage(
  dto: ListDto,
  rsvps: readonly RsvpDto[],
): PracticeSessionListPage {
  const rsvpBySessionId = new Map(rsvps.map((rsvp) => [rsvp.sessionId, rsvp]));
  const items = dto.items.flatMap((session) => {
    const rsvp = rsvpBySessionId.get(session.id);
    return rsvp === undefined ? [] : [mapPracticeSessionSummary(session, rsvp)];
  });
  return {
    items,
    page: Math.floor(dto.offset / dto.limit) + 1,
    pageSize: dto.limit,
    total: dto.total,
    hasMore: dto.offset + dto.items.length < dto.total,
  };
}

/** Exact session + self-RSVP resources projected into the existing detail UI. */
export function mapPracticeSessionDetail(
  session: SessionDto,
  rsvp: RsvpDto,
): PracticeSessionDetail {
  const canRespond = session.status === 'published' || session.status === 'rescheduled';
  return {
    id: session.id,
    type: mapPracticeType(session.sessionType),
    title: null,
    status: mapPracticeStatus(session.status),
    startAtIso: session.startsAt,
    endAtIso: session.endsAt,
    meetAtIso: session.meetAt,
    rsvpDeadlineAtIso: session.rsvpCutoffAt,
    venue: null,
    instructions: null,
    capacity: session.capacity,
    counts: null,
    agenda: [],
    rsvp: mapRsvpState(rsvp, session.rsvpCutoffAt, canRespond),
    changeKind: mapChangeKind(session.status),
    updatedAtIso: session.updatedAt,
  };
}

/** Client-side RSVP filter for a backend page whose list DTO has no RSVP filter. */
export function filterPracticePageByRsvp(
  page: PracticeSessionListPage,
  status: RsvpStatus | null,
): PracticeSessionListPage {
  return status === null
    ? page
    : {
        ...page,
        items: page.items.filter((item) => item.myRsvpStatus === status),
      };
}

/** Client-side fallback for the generated contract's free-form sessionType. */
export function filterPracticePageByType(
  page: PracticeSessionListPage,
  type: PracticeType | null,
): PracticeSessionListPage {
  return type === null
    ? page
    : {
        ...page,
        items: page.items.filter((item) => item.type === type),
      };
}

/** UI type filter fallback for backend session types outside the known vocabulary. */
export function toBackendSessionType(type: PracticeType | null): string | null {
  return type === PRACTICE_TYPE.custom ? null : type;
}
