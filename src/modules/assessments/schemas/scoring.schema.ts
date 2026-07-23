import { schemaBuilder } from '@/packages/schema';

/**
 * Exact runtime mirrors of the scoring self-read DTOs
 * (`ScoreListResponseDto` and its nested explanation). `value: null` means
 * "not computed yet" and is never rendered as 0.
 */
const isoInstant = schemaBuilder.iso.datetime({ offset: true });

const confidenceSchema = schemaBuilder.enum(['none', 'low', 'medium', 'high']);

const scoreComponentResponseSchema = schemaBuilder.object({
  assessedMetrics: schemaBuilder.number().int().nonnegative(),
  categoryKey: schemaBuilder.enum([
    'training',
    'technical',
    'tactical',
    'physical',
    'psychological',
    'behavioral',
    'attendance',
  ]),
  display: schemaBuilder.number().nullable(),
  excludedReason: schemaBuilder.string().nullable(),
  included: schemaBuilder.boolean(),
  totalMetrics: schemaBuilder.number().int().nonnegative(),
  unrounded: schemaBuilder.number().nullable(),
  weight: schemaBuilder.number(),
});

const overallExplanationResponseSchema = schemaBuilder.object({
  denominator: schemaBuilder.number(),
  display: schemaBuilder.number().nullable(),
  excludedCount: schemaBuilder.number().int().nonnegative(),
  includedCount: schemaBuilder.number().int().nonnegative(),
  numerator: schemaBuilder.number(),
  sufficient: schemaBuilder.boolean(),
  unrounded: schemaBuilder.number().nullable(),
});

const scoreRuleReferenceResponseSchema = schemaBuilder.object({
  name: schemaBuilder.string(),
  ruleId: schemaBuilder.string().min(1),
  ruleKey: schemaBuilder.string().min(1),
  version: schemaBuilder.number().int(),
});

const scoreExplanationResponseSchema = schemaBuilder.object({
  completeness: schemaBuilder.number(),
  components: schemaBuilder.array(scoreComponentResponseSchema),
  confidence: confidenceSchema,
  formulaVersion: schemaBuilder.number().int(),
  overall: overallExplanationResponseSchema,
  rule: scoreRuleReferenceResponseSchema,
});

const scoreResponseSchema = schemaBuilder.object({
  completeness: schemaBuilder.number(),
  computedAt: isoInstant.nullable(),
  confidence: confidenceSchema,
  createdAt: isoInstant,
  denominator: schemaBuilder.number().nullable(),
  error: schemaBuilder.string().nullable(),
  excludedCount: schemaBuilder.number().int().nonnegative(),
  explanation: scoreExplanationResponseSchema.nullable(),
  id: schemaBuilder.string().min(1),
  includedCount: schemaBuilder.number().int().nonnegative(),
  membershipId: schemaBuilder.string().min(1),
  numerator: schemaBuilder.number().nullable(),
  periodId: schemaBuilder.string().nullable(),
  ruleId: schemaBuilder.string().min(1),
  ruleKey: schemaBuilder.string().min(1),
  ruleVersion: schemaBuilder.number().int(),
  seasonId: schemaBuilder.string().nullable(),
  sourceHash: schemaBuilder.string().nullable(),
  status: schemaBuilder.enum(['stale', 'building', 'ready', 'failed']),
  teamId: schemaBuilder.string().min(1),
  updatedAt: isoInstant,
  value: schemaBuilder.number().nullable(),
});

export const scoreListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(scoreResponseSchema),
});
