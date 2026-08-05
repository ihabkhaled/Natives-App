import { schemaBuilder } from '@/packages/schema';

/**
 * Exact runtime mirrors of the generated NestJS RSVP-detail DTOs
 * (`ListRsvpsResponseDto`, `RsvpSummaryResponseDto`, `RsvpResponseDto`,
 * `RsvpHistoryResponseDto`). The status/reason literal tuples are redeclared
 * here rather than derived from `practice`'s `RSVP_STATUS`/`RSVP_REASON`
 * because Zod needs a literal tuple, not a runtime-computed array — the same
 * choice `practice-session.schema.ts` makes for its own RSVP schema.
 */
const isoInstant = schemaBuilder.iso.datetime({ offset: true });

const rsvpStatusSchema = schemaBuilder.enum(['going', 'not_going', 'maybe', 'no_response']);

const rsvpReasonSchema = schemaBuilder.enum(['injury', 'work', 'travel', 'personal', 'other']);

const rsvpSourceSchema = schemaBuilder.enum(['self', 'coach', 'admin', 'import', 'system']);

const rsvpNoteVisibilitySchema = schemaBuilder.enum(['coaches', 'team']);

export const rsvpParticipantResponseSchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
  status: rsvpStatusSchema,
  waitlisted: schemaBuilder.boolean(),
  source: rsvpSourceSchema,
  respondedAt: isoInstant,
});

export const listRsvpsResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(rsvpParticipantResponseSchema),
  total: schemaBuilder.number(),
  limit: schemaBuilder.number(),
  offset: schemaBuilder.number(),
});

/** Aggregate counts only — never a membership id, by contract. */
export const rsvpSummaryResponseSchema = schemaBuilder.object({
  sessionId: schemaBuilder.string().min(1),
  capacity: schemaBuilder.number().nullable(),
  going: schemaBuilder.number(),
  waitlisted: schemaBuilder.number(),
  notGoing: schemaBuilder.number(),
  maybe: schemaBuilder.number(),
  noResponse: schemaBuilder.number(),
  spotsRemaining: schemaBuilder.number().nullable(),
});

export const rsvpResponseSchema = schemaBuilder.object({
  sessionId: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  status: rsvpStatusSchema,
  reasonCategory: rsvpReasonSchema.nullable(),
  note: schemaBuilder.string().nullable(),
  noteVisibility: rsvpNoteVisibilitySchema.nullable(),
  source: rsvpSourceSchema.nullable(),
  waitlisted: schemaBuilder.boolean(),
  respondedAt: isoInstant.nullable(),
  version: schemaBuilder.number().nullable(),
});

export const rsvpRevisionResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  fromStatus: rsvpStatusSchema.nullable(),
  toStatus: rsvpStatusSchema,
  reasonCategory: rsvpReasonSchema.nullable(),
  note: schemaBuilder.string().nullable(),
  waitlisted: schemaBuilder.boolean(),
  source: rsvpSourceSchema,
  isOverride: schemaBuilder.boolean(),
  overrideReason: schemaBuilder.string().nullable(),
  actorUserId: schemaBuilder.string().nullable(),
  occurredAt: isoInstant,
});

export const rsvpHistoryResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(rsvpRevisionResponseSchema),
});
