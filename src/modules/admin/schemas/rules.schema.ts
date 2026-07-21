import {
  isoDateField,
  isoInstantField,
  pagedEnvelopeFields,
  schemaBuilder,
} from '@/packages/schema';

import { CONFIDENCE_LEVELS, RULE_STATUSES } from '../constants/admin.constants';

/**
 * Wire contracts for the two versioned rule families. `points` is null when a
 * category is deliberately not scored — never coerced to zero.
 */
const pointEntrySchema = schemaBuilder.object({
  activityCategory: schemaBuilder.string().min(1),
  points: schemaBuilder.number().nullable(),
  dailyCap: schemaBuilder.number().nullable(),
  cooldownDays: schemaBuilder.number().nullable(),
});

export const ruleResponseSchema = schemaBuilder.object({
  ruleId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().nullable(),
  seasonId: schemaBuilder.string().nullable(),
  ruleKey: schemaBuilder.string().min(1),
  version: schemaBuilder.number().int().nonnegative(),
  name: schemaBuilder.string().min(1),
  description: schemaBuilder.string().nullable(),
  status: schemaBuilder.enum(RULE_STATUSES),
  pointEntries: schemaBuilder.array(pointEntrySchema),
  effectiveFrom: isoDateField.nullable(),
  effectiveTo: isoDateField.nullable(),
  recordVersion: schemaBuilder.number().int().positive(),
  publishedAt: isoInstantField.nullable(),
  retiredAt: isoInstantField.nullable(),
  updatedAt: isoInstantField,
});

export const ruleListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(ruleResponseSchema),
  ...pagedEnvelopeFields,
});

const scoreExplanationSchema = schemaBuilder.object({
  completeness: schemaBuilder.number(),
  confidence: schemaBuilder.enum(CONFIDENCE_LEVELS),
  formulaVersion: schemaBuilder.number().int().nonnegative(),
});

export const simulationResponseSchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
  draft: scoreExplanationSchema,
  published: scoreExplanationSchema.nullable(),
  delta: schemaBuilder.number().nullable(),
});
