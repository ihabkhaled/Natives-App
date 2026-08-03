import { isoInstantField, pagedEnvelopeFields, schemaBuilder } from '@/packages/schema';

import { ANOMALY_SEVERITIES, ANOMALY_STATUSES } from '../constants/data-quality.constants';

/**
 * Wire contracts for the data-quality operations queue, shared by remote
 * NestJS mode and MSW mock mode.
 *
 * `ruleKey` and `resourceRef` are server-authored identifiers shown verbatim —
 * never parsed for meaning here, so a rule added on the server needs no client
 * release. `severity` and `status` are enumerated because the queue orders and
 * filters by them.
 */
export const anomalyResponseSchema = schemaBuilder.object({
  anomalyId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  ruleKey: schemaBuilder.string().min(1),
  ruleVersion: schemaBuilder.string().min(1),
  severity: schemaBuilder.enum(ANOMALY_SEVERITIES),
  resourceType: schemaBuilder.string().min(1),
  resourceRef: schemaBuilder.string().min(1),
  occurrenceCount: schemaBuilder.number().int().nonnegative(),
  status: schemaBuilder.enum(ANOMALY_STATUSES),
  ownerUserId: schemaBuilder.string().nullable(),
  resolution: schemaBuilder.string().nullable(),
  suppressedUntil: schemaBuilder.string().nullable(),
  recordVersion: schemaBuilder.number().int().positive(),
  firstSeenAt: isoInstantField,
  lastSeenAt: isoInstantField,
  resolvedAt: schemaBuilder.string().nullable(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const listAnomaliesResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(anomalyResponseSchema),
  ...pagedEnvelopeFields,
});

/**
 * What a repair would do, before it does it. `reversible` decides whether the
 * screen may offer an undo afterwards, so an operator is never told a change
 * can be taken back when it cannot.
 */
export const repairPreviewResponseSchema = schemaBuilder.object({
  anomalyId: schemaBuilder.string().min(1),
  repairKind: schemaBuilder.string().min(1),
  impactCount: schemaBuilder.number().int().nonnegative(),
  impactSummary: schemaBuilder.string(),
  reversible: schemaBuilder.boolean(),
});

export const repairResponseSchema = schemaBuilder.object({
  repairId: schemaBuilder.string().min(1),
  anomalyId: schemaBuilder.string().min(1),
  repairKind: schemaBuilder.string().min(1),
  status: schemaBuilder.string().min(1),
  impactCount: schemaBuilder.number().int().nonnegative(),
  impactSummary: schemaBuilder.string().nullable(),
  rollbackRef: schemaBuilder.string().nullable(),
  recordVersion: schemaBuilder.number().int().positive(),
  appliedAt: schemaBuilder.string().nullable(),
  rolledBackAt: schemaBuilder.string().nullable(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const scanReportResponseSchema = schemaBuilder.object({
  ruleVersion: schemaBuilder.string().min(1),
  rulesRun: schemaBuilder.number().int().nonnegative(),
  detected: schemaBuilder.number().int().nonnegative(),
  opened: schemaBuilder.number().int().nonnegative(),
  reopened: schemaBuilder.number().int().nonnegative(),
  alertable: schemaBuilder.number().int().nonnegative(),
});
