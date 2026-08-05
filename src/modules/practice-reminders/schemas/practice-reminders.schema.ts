import { schemaBuilder } from '@/packages/schema';

import { REMINDER_SUPPRESSION_REASONS } from '../constants/practice-reminders.constants';

/**
 * Wire contracts for practice reminders, shared by remote NestJS mode and MSW
 * mock mode.
 *
 * `kinds` is a plain string array rather than an enum: the reminder catalogue
 * is server-owned and grows (session published, rescheduled, cancelled, RSVP,
 * check-in, agenda published). Pinning it to a client enum would turn every
 * new server reminder into a parse failure on a screen that only needs to
 * count and name them.
 */
export const reminderStatusResponseSchema = schemaBuilder.object({
  sessionId: schemaBuilder.string().min(1),
  totalEligible: schemaBuilder.number(),
  noResponse: schemaBuilder.number(),
  upcoming: schemaBuilder.boolean(),
  cutoff: schemaBuilder.boolean(),
  urgentCancellationOverride: schemaBuilder.boolean(),
  kinds: schemaBuilder.array(schemaBuilder.string()),
});

/**
 * What a dispatch actually did. `candidates` and `enqueued` differ whenever a
 * recipient was suppressed — by quiet hours, by preference, or by already
 * having been sent this reminder — so both travel and the UI reports the gap
 * rather than implying every candidate was mailed.
 */
export const reminderDispatchResponseSchema = schemaBuilder.object({
  candidates: schemaBuilder.number(),
  enqueued: schemaBuilder.number(),
});

/** A self-test either queued or was suppressed, with the server's reason. */
export const reminderTestResponseSchema = schemaBuilder.object({
  enqueued: schemaBuilder.boolean(),
  reason: schemaBuilder.enum(REMINDER_SUPPRESSION_REASONS).nullish(),
});
