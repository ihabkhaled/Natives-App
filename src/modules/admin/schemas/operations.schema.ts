import { isoInstantField, pagedEnvelopeFields, schemaBuilder } from '@/packages/schema';

import { AUDIT_OUTCOMES, JOB_STATUSES } from '../constants/admin.constants';

/**
 * Wire contracts for the operations centre, all live as of contract 1.2.0
 * (dead letters and job health shipped with the scheduled-job heartbeat
 * work). Privacy is encoded in the shape: a dead letter carries an id, a
 * type, a stable `failureCode` classification, and a count — there is no
 * payload or raw error-text field at all, so the client cannot render one by
 * mistake.
 */
export const outboxMetricsResponseSchema = schemaBuilder.object({
  pending: schemaBuilder.number().int().nonnegative(),
  processing: schemaBuilder.number().int().nonnegative(),
  completed: schemaBuilder.number().int().nonnegative(),
  deadLettered: schemaBuilder.number().int().nonnegative(),
});

export const replayResponseSchema = schemaBuilder.object({
  eventId: schemaBuilder.string().min(1),
  requeued: schemaBuilder.boolean(),
});

const deadLetterResponseSchema = schemaBuilder.object({
  eventId: schemaBuilder.string().min(1),
  eventType: schemaBuilder.string().min(1),
  attempts: schemaBuilder.number().int().nonnegative(),
  failedAt: isoInstantField,
  failureCode: schemaBuilder.string().min(1),
});

export const deadLetterListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(deadLetterResponseSchema),
  ...pagedEnvelopeFields,
});

const jobHealthResponseSchema = schemaBuilder.object({
  jobKey: schemaBuilder.string().min(1),
  status: schemaBuilder.enum(JOB_STATUSES),
  lastRunAt: isoInstantField.nullable(),
  failureCount: schemaBuilder.number().int().nonnegative(),
});

export const jobHealthListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(jobHealthResponseSchema),
});

/**
 * An audit entry's `diff` is summarised, never rendered: the schema keeps it
 * as an opaque record so the mapper can count its fields and drop the values.
 */
const auditEntryResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  actorUserId: schemaBuilder.string().nullable(),
  action: schemaBuilder.string().min(1),
  resourceType: schemaBuilder.string().min(1),
  resourceId: schemaBuilder.string().nullable(),
  correlationId: schemaBuilder.string().nullable(),
  outcome: schemaBuilder.enum(AUDIT_OUTCOMES),
  diff: schemaBuilder.record(schemaBuilder.string(), schemaBuilder.unknown()),
  occurredAt: isoInstantField,
});

export const auditListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(auditEntryResponseSchema),
  ...pagedEnvelopeFields,
});
