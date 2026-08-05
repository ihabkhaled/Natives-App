import type { SchemaOutput } from '@/packages/schema';

import type {
  listRsvpsResponseSchema,
  rsvpHistoryResponseSchema,
  rsvpParticipantResponseSchema,
  rsvpResponseSchema,
  rsvpRevisionResponseSchema,
  rsvpSummaryResponseSchema,
} from '../schemas/practice-rsvp-detail.schema';
import type {
  RsvpHistory,
  RsvpParticipant,
  RsvpParticipantsPage,
  RsvpRecord,
  RsvpRevision,
  RsvpSummary,
} from '../types/practice-rsvp-detail.types';

type ParticipantDto = SchemaOutput<typeof rsvpParticipantResponseSchema>;
type ListDto = SchemaOutput<typeof listRsvpsResponseSchema>;
type SummaryDto = SchemaOutput<typeof rsvpSummaryResponseSchema>;
type RecordDto = SchemaOutput<typeof rsvpResponseSchema>;
type RevisionDto = SchemaOutput<typeof rsvpRevisionResponseSchema>;
type HistoryDto = SchemaOutput<typeof rsvpHistoryResponseSchema>;

/** Wire `respondedAt` renamed to the app's `…Iso` convention. */
function mapParticipant(dto: ParticipantDto): RsvpParticipant {
  return {
    membershipId: dto.membershipId,
    status: dto.status,
    waitlisted: dto.waitlisted,
    source: dto.source,
    respondedAtIso: dto.respondedAt,
  };
}

/** Exact offset page translated into the app's pagination vocabulary. */
export function mapParticipantsPage(dto: ListDto): RsvpParticipantsPage {
  return {
    items: dto.items.map(mapParticipant),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
  };
}

/** Aggregate counts pass straight through — nothing here is renamed or derived. */
export function mapSummary(dto: SummaryDto): RsvpSummary {
  return {
    sessionId: dto.sessionId,
    capacity: dto.capacity,
    going: dto.going,
    waitlisted: dto.waitlisted,
    notGoing: dto.notGoing,
    maybe: dto.maybe,
    noResponse: dto.noResponse,
    spotsRemaining: dto.spotsRemaining,
  };
}

/** The record an override write (or a future single-member read) resolves to. */
export function mapRecord(dto: RecordDto): RsvpRecord {
  return {
    sessionId: dto.sessionId,
    membershipId: dto.membershipId,
    status: dto.status,
    reasonCategory: dto.reasonCategory,
    note: dto.note,
    noteVisibility: dto.noteVisibility,
    source: dto.source,
    waitlisted: dto.waitlisted,
    respondedAtIso: dto.respondedAt,
    version: dto.version,
  };
}

function mapRevision(dto: RevisionDto): RsvpRevision {
  return {
    id: dto.id,
    membershipId: dto.membershipId,
    fromStatus: dto.fromStatus,
    toStatus: dto.toStatus,
    reasonCategory: dto.reasonCategory,
    note: dto.note,
    waitlisted: dto.waitlisted,
    source: dto.source,
    isOverride: dto.isOverride,
    overrideReason: dto.overrideReason,
    actorUserId: dto.actorUserId,
    occurredAtIso: dto.occurredAt,
  };
}

/** The full revision trail for one member, oldest-first exactly as the server orders it. */
export function mapHistory(dto: HistoryDto): RsvpHistory {
  return { items: dto.items.map(mapRevision) };
}
