import { schemaBuilder } from '@/packages/schema';

/**
 * Exact runtime mirrors of the measurement self-read DTOs
 * (`HistoryResponseDto` grouped by protocol). Nullable values stay nullable —
 * a disqualified attempt's `canonicalValue: null` is a gap, never a zero.
 */
const isoInstant = schemaBuilder.iso.datetime({ offset: true });

const measurementUnitSchema = schemaBuilder.enum([
  'seconds',
  'milliseconds',
  'meters',
  'centimeters',
  'kilograms',
  'meters_per_second',
  'count',
  'level',
  'percent',
]);

const directionSchema = schemaBuilder.enum(['better_higher', 'better_lower']);
const resultPolicySchema = schemaBuilder.enum(['best', 'average', 'latest']);

const attemptResponseSchema = schemaBuilder.object({
  attemptNumber: schemaBuilder.number().int(),
  canonicalValue: schemaBuilder.number().nullable(),
  createdAt: isoInstant,
  disqualified: schemaBuilder.boolean(),
  dqReason: schemaBuilder.string().nullable(),
  evaluatorUserId: schemaBuilder.string().nullable(),
  id: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  notes: schemaBuilder.string().nullable(),
  protocolId: schemaBuilder.string().min(1),
  rawValue: schemaBuilder.number().nullable(),
  recordedAt: isoInstant,
  sessionId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  unit: measurementUnitSchema,
  valid: schemaBuilder.boolean(),
});

const protocolResponseSchema = schemaBuilder.object({
  createdAt: isoInstant,
  createdBy: schemaBuilder.string().nullable(),
  description: schemaBuilder.string().nullable(),
  direction: directionSchema,
  discipline: schemaBuilder.enum([
    'speed',
    'agility',
    'endurance',
    'strength_power',
    'reaction',
    'throwing_accuracy',
    'throwing_distance',
    'catching',
    'jumping',
    'custom',
  ]),
  id: schemaBuilder.string().min(1),
  instructions: schemaBuilder.string().nullable(),
  maxValue: schemaBuilder.number().nullable(),
  minValue: schemaBuilder.number().nullable(),
  name: schemaBuilder.string().min(1),
  protocolKey: schemaBuilder.string().min(1),
  recordVersion: schemaBuilder.number().int(),
  resultPolicy: resultPolicySchema,
  safetyNotes: schemaBuilder.string().nullable(),
  seasonId: schemaBuilder.string().nullable(),
  status: schemaBuilder.enum(['active', 'archived']),
  teamId: schemaBuilder.string().nullable(),
  unit: measurementUnitSchema,
  updatedAt: isoInstant,
});

const resultSelectionResponseSchema = schemaBuilder.object({
  average: schemaBuilder.number().nullable(),
  best: schemaBuilder.number().nullable(),
  consideredCount: schemaBuilder.number().int().nonnegative(),
  direction: directionSchema,
  excludedCount: schemaBuilder.number().int().nonnegative(),
  latest: schemaBuilder.number().nullable(),
  method: resultPolicySchema,
  selected: schemaBuilder.number().nullable(),
});

const protocolHistoryEntryResponseSchema = schemaBuilder.object({
  attempts: schemaBuilder.array(attemptResponseSchema),
  protocol: protocolResponseSchema,
  result: resultSelectionResponseSchema,
});

export const measurementHistoryResponseSchema = schemaBuilder.object({
  entries: schemaBuilder.array(protocolHistoryEntryResponseSchema),
  membershipId: schemaBuilder.string().min(1),
});
