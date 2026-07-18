import { schemaBuilder } from '@/packages/schema';

/** Exact runtime mirrors of the generated NestJS practice-session DTOs. */
const isoInstant = schemaBuilder.iso.datetime({ offset: true });

const practiceStatusSchema = schemaBuilder.enum([
  'draft',
  'published',
  'rescheduled',
  'cancelled',
  'completed',
  'archived',
]);

const rsvpStatusSchema = schemaBuilder.enum(['going', 'not_going', 'maybe', 'no_response']);

const rsvpReasonSchema = schemaBuilder.enum(['injury', 'travel', 'work', 'personal', 'other']);

const rsvpSourceSchema = schemaBuilder.enum(['self', 'coach', 'admin', 'import', 'system']);

export const practiceRsvpResponseSchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
  sessionId: schemaBuilder.string().min(1),
  status: rsvpStatusSchema,
  reasonCategory: rsvpReasonSchema.nullable(),
  note: schemaBuilder.string().nullable(),
  noteVisibility: schemaBuilder.enum(['coaches', 'team']).nullable(),
  respondedAt: isoInstant.nullable(),
  source: rsvpSourceSchema.nullable(),
  version: schemaBuilder.number().int().nonnegative().nullable(),
  waitlisted: schemaBuilder.boolean(),
});

export const practiceSessionResponseSchema = schemaBuilder.object({
  cancellationReason: schemaBuilder.string().nullable(),
  capacity: schemaBuilder.number().int().nonnegative().nullable(),
  createdAt: isoInstant,
  createdBy: schemaBuilder.string().nullable(),
  endsAt: isoInstant,
  field: schemaBuilder.string().nullable(),
  id: schemaBuilder.string().min(1),
  meetAt: isoInstant.nullable(),
  notes: schemaBuilder.string().nullable(),
  occurrenceDate: schemaBuilder.string().nullable(),
  organizerUserId: schemaBuilder.string().nullable(),
  rsvpCutoffAt: isoInstant.nullable(),
  scheduleId: schemaBuilder.string().nullable(),
  seasonId: schemaBuilder.string().nullable(),
  sessionType: schemaBuilder.string().min(1),
  startsAt: isoInstant,
  status: practiceStatusSchema,
  teamId: schemaBuilder.string().min(1),
  timezone: schemaBuilder.string().min(1),
  updatedAt: isoInstant,
  updatedBy: schemaBuilder.string().nullable(),
  venueId: schemaBuilder.string().nullable(),
  version: schemaBuilder.number().int().nonnegative(),
  visibility: schemaBuilder.enum(['team', 'coaches', 'public']),
});

export const practiceSessionListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(practiceSessionResponseSchema),
  limit: schemaBuilder.number().int().positive(),
  offset: schemaBuilder.number().int().nonnegative(),
  total: schemaBuilder.number().int().nonnegative(),
});
