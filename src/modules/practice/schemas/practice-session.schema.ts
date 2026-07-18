import { schemaBuilder } from '@/packages/schema';

/**
 * Wire contract for the practice calendar, session detail, and RSVP endpoints,
 * shared by remote NestJS mode and MSW mock mode. Instants are ISO-8601 UTC;
 * numeric projections that may be unknown are nullable and never coerced to
 * zero. Mirrors the backend contract from prompts 200/201.
 */
const isoInstant = schemaBuilder.iso.datetime({ offset: true });

const practiceTypeSchema = schemaBuilder.enum([
  'practice',
  'fitness',
  'scrimmage',
  'game',
  'throwing',
  'running',
  'gym',
  'rules',
  'custom',
]);

const practiceStatusSchema = schemaBuilder.enum(['scheduled', 'rescheduled', 'cancelled']);

const rsvpStatusSchema = schemaBuilder.enum(['going', 'not_going', 'maybe', 'no_response']);

const rsvpReasonSchema = schemaBuilder.enum(['injury', 'travel', 'work', 'personal', 'other']);

const practiceChangeKindSchema = schemaBuilder.enum(['rescheduled', 'venue_changed', 'cancelled']);

const venueSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  name: schemaBuilder.string().min(1),
  addressLine: schemaBuilder.string().nullable(),
  mapUrl: schemaBuilder.url().nullable(),
  notes: schemaBuilder.string().nullable(),
});

const agendaItemSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  labelKey: schemaBuilder.string().min(1),
  durationMinutes: schemaBuilder.number().int().nonnegative().nullable(),
});

const sessionCountsSchema = schemaBuilder.object({
  going: schemaBuilder.number().int().nonnegative(),
  maybe: schemaBuilder.number().int().nonnegative(),
  notGoing: schemaBuilder.number().int().nonnegative(),
  waitlist: schemaBuilder.number().int().nonnegative(),
});

export const rsvpStateSchema = schemaBuilder.object({
  status: rsvpStatusSchema,
  reasonCategory: rsvpReasonSchema.nullable(),
  respondedAt: isoInstant.nullable(),
  version: schemaBuilder.number().int().nonnegative(),
  waitlisted: schemaBuilder.boolean(),
  waitlistPosition: schemaBuilder.number().int().positive().nullable(),
  deadlineAt: isoInstant.nullable(),
  canRespond: schemaBuilder.boolean(),
});

/** Fields shared by the calendar summary and the full detail. */
const sessionCoreShape = {
  id: schemaBuilder.string().min(1),
  type: practiceTypeSchema,
  title: schemaBuilder.string().nullable(),
  status: practiceStatusSchema,
  startAt: isoInstant,
  endAt: isoInstant,
  meetAt: isoInstant.nullable(),
  rsvpDeadlineAt: isoInstant.nullable(),
  capacity: schemaBuilder.number().int().positive().nullable(),
  changeKind: practiceChangeKindSchema.nullable(),
};

export const practiceSessionSummarySchema = schemaBuilder.object({
  ...sessionCoreShape,
  venueName: schemaBuilder.string().nullable(),
  myRsvpStatus: rsvpStatusSchema,
  waitlisted: schemaBuilder.boolean(),
});

export const practiceSessionListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(practiceSessionSummarySchema),
  page: schemaBuilder.number().int().positive(),
  pageSize: schemaBuilder.number().int().positive(),
  total: schemaBuilder.number().int().nonnegative(),
  hasMore: schemaBuilder.boolean(),
});

export const upcomingPracticesResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(practiceSessionSummarySchema),
});

export const practiceSessionDetailSchema = schemaBuilder.object({
  ...sessionCoreShape,
  venue: venueSchema.nullable(),
  instructions: schemaBuilder.string().nullable(),
  counts: sessionCountsSchema.nullable(),
  agenda: schemaBuilder.array(agendaItemSchema),
  rsvp: rsvpStateSchema,
  updatedAt: isoInstant,
});
