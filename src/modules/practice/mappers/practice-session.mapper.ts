import type { SchemaOutput } from '@/packages/schema';

import type {
  practiceSessionDetailSchema,
  practiceSessionListResponseSchema,
  practiceSessionSummarySchema,
  rsvpStateSchema,
  upcomingPracticesResponseSchema,
} from '../schemas/practice-session.schema';
import type {
  PracticeSessionDetail,
  PracticeSessionListPage,
  PracticeSessionSummary,
  RsvpState,
} from '../types/practice.types';

type SummaryDto = SchemaOutput<typeof practiceSessionSummarySchema>;
type ListDto = SchemaOutput<typeof practiceSessionListResponseSchema>;
type UpcomingDto = SchemaOutput<typeof upcomingPracticesResponseSchema>;
type DetailDto = SchemaOutput<typeof practiceSessionDetailSchema>;
type RsvpDto = SchemaOutput<typeof rsvpStateSchema>;

/** Pure DTO → domain projection for one RSVP state (renames wire instants). */
export function mapRsvpState(dto: RsvpDto): RsvpState {
  return {
    status: dto.status,
    reasonCategory: dto.reasonCategory,
    respondedAtIso: dto.respondedAt,
    version: dto.version,
    waitlisted: dto.waitlisted,
    waitlistPosition: dto.waitlistPosition,
    deadlineAtIso: dto.deadlineAt,
    canRespond: dto.canRespond,
  };
}

/** Pure DTO → domain projection for one calendar list item. */
export function mapPracticeSessionSummary(dto: SummaryDto): PracticeSessionSummary {
  return {
    id: dto.id,
    type: dto.type,
    title: dto.title,
    status: dto.status,
    startAtIso: dto.startAt,
    endAtIso: dto.endAt,
    meetAtIso: dto.meetAt,
    rsvpDeadlineAtIso: dto.rsvpDeadlineAt,
    venueName: dto.venueName,
    capacity: dto.capacity,
    myRsvpStatus: dto.myRsvpStatus,
    waitlisted: dto.waitlisted,
    changeKind: dto.changeKind,
  };
}

/** Pure DTO → domain projection for a bounded, paginated calendar page. */
export function mapPracticeSessionListPage(dto: ListDto): PracticeSessionListPage {
  return {
    items: dto.items.map(mapPracticeSessionSummary),
    page: dto.page,
    pageSize: dto.pageSize,
    total: dto.total,
    hasMore: dto.hasMore,
  };
}

/** Pure DTO → domain projection for the bounded upcoming list. */
export function mapUpcomingPractices(dto: UpcomingDto): readonly PracticeSessionSummary[] {
  return dto.items.map(mapPracticeSessionSummary);
}

/** Pure DTO → domain projection for the full session detail. */
export function mapPracticeSessionDetail(dto: DetailDto): PracticeSessionDetail {
  return {
    id: dto.id,
    type: dto.type,
    title: dto.title,
    status: dto.status,
    startAtIso: dto.startAt,
    endAtIso: dto.endAt,
    meetAtIso: dto.meetAt,
    rsvpDeadlineAtIso: dto.rsvpDeadlineAt,
    venue:
      dto.venue === null
        ? null
        : {
            id: dto.venue.id,
            name: dto.venue.name,
            addressLine: dto.venue.addressLine,
            mapUrl: dto.venue.mapUrl,
            notes: dto.venue.notes,
          },
    instructions: dto.instructions,
    capacity: dto.capacity,
    counts:
      dto.counts === null
        ? null
        : {
            going: dto.counts.going,
            maybe: dto.counts.maybe,
            notGoing: dto.counts.notGoing,
            waitlist: dto.counts.waitlist,
          },
    agenda: dto.agenda.map((item) => ({
      id: item.id,
      labelKey: item.labelKey,
      durationMinutes: item.durationMinutes,
    })),
    rsvp: mapRsvpState(dto.rsvp),
    changeKind: dto.changeKind,
    updatedAtIso: dto.updatedAt,
  };
}
