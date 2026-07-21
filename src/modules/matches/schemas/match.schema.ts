import { isoInstantField, pagedEnvelopeFields, schemaBuilder } from '@/packages/schema';

import {
  MATCH_CAPS,
  MATCH_EVENT_TYPES,
  MATCH_OPERATION_OUTCOMES,
  MATCH_RESULTS,
  MATCH_STATUSES,
  SCORING_SIDES,
} from '../constants/matches.constants';

/**
 * Wire contracts for the backend matches module (503). Every cap and
 * allowance is nullable: a rule set that does not define a hard cap reports
 * null and the scoreboard says "not set" rather than printing 0.
 */

/**
 * The score-state block both the match record and the scoreboard projection
 * carry, declared once so the two can never drift apart. `streamVersion` is
 * the optimistic-concurrency token the offline queue submits back.
 */
const scoreStateFields = {
  status: schemaBuilder.enum(MATCH_STATUSES),
  ourScore: schemaBuilder.number().int().nonnegative(),
  opponentScore: schemaBuilder.number().int().nonnegative(),
  period: schemaBuilder.number().int().positive(),
  streamVersion: schemaBuilder.number().int().nonnegative(),
  recordVersion: schemaBuilder.number().int().nonnegative(),
  revision: schemaBuilder.number().int().nonnegative(),
  result: schemaBuilder.enum(MATCH_RESULTS),
} as const;

export const matchResponseSchema = schemaBuilder.object({
  matchId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().min(1),
  competitionId: schemaBuilder.string().min(1),
  fixtureId: schemaBuilder.string().min(1),
  rosterId: schemaBuilder.string().nullable(),
  rulesetId: schemaBuilder.string().min(1),
  homeAway: schemaBuilder.string().min(1),
  ...scoreStateFields,
  capApplied: schemaBuilder.enum(MATCH_CAPS),
  engineVersion: schemaBuilder.string().min(1),
  notes: schemaBuilder.string().nullable(),
  startedAt: isoInstantField.nullable(),
  completedAt: isoInstantField.nullable(),
  finalizedAt: isoInstantField.nullable(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const matchListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(matchResponseSchema),
  ...pagedEnvelopeFields,
});

export const matchTimeoutStateSchema = schemaBuilder.object({
  allowance: schemaBuilder.number().int().nonnegative(),
  usedByUs: schemaBuilder.number().int().nonnegative(),
  usedByThem: schemaBuilder.number().int().nonnegative(),
  remainingForUs: schemaBuilder.number().int().nonnegative(),
  remainingForThem: schemaBuilder.number().int().nonnegative(),
});

export const matchScoreboardResponseSchema = schemaBuilder.object({
  matchId: schemaBuilder.string().min(1),
  ...scoreStateFields,
  rulesetKey: schemaBuilder.string().min(1),
  rulesetVersion: schemaBuilder.number().int().nonnegative(),
  engineVersion: schemaBuilder.string().min(1),
  target: schemaBuilder.number().int().positive(),
  capApplied: schemaBuilder.enum(MATCH_CAPS),
  complete: schemaBuilder.boolean(),
  halftimeReached: schemaBuilder.boolean(),
  scoringOpen: schemaBuilder.boolean(),
  timeouts: matchTimeoutStateSchema,
});

export const matchEventResponseSchema = schemaBuilder.object({
  eventId: schemaBuilder.string().min(1),
  matchId: schemaBuilder.string().min(1),
  sequence: schemaBuilder.number().int().nonnegative(),
  operationId: schemaBuilder.string().min(1),
  eventType: schemaBuilder.enum(MATCH_EVENT_TYPES),
  scoringSide: schemaBuilder.enum(SCORING_SIDES).nullable(),
  points: schemaBuilder.number().int().nullable(),
  ourScoreAfter: schemaBuilder.number().int().nonnegative(),
  opponentScoreAfter: schemaBuilder.number().int().nonnegative(),
  period: schemaBuilder.number().int().positive(),
  scorerMembershipId: schemaBuilder.string().nullable(),
  assistMembershipId: schemaBuilder.string().nullable(),
  voidsEventId: schemaBuilder.string().nullable(),
  voided: schemaBuilder.boolean(),
  voidReason: schemaBuilder.string().nullable(),
  occurredAt: isoInstantField.nullable(),
  recordedAt: isoInstantField,
});

export const matchEventListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(matchEventResponseSchema),
  ...pagedEnvelopeFields,
});

/**
 * The idempotent command envelope. `outcome` is the whole point of the
 * contract: `applied` changed the stream, `replayed` means the same operation
 * id with the same payload arrived twice and the score did NOT move, and
 * `conflict` means the same id carried a different payload.
 */
export const matchOperationResponseSchema = schemaBuilder.object({
  outcome: schemaBuilder.enum(MATCH_OPERATION_OUTCOMES),
  event: matchEventResponseSchema,
  streamVersion: schemaBuilder.number().int().nonnegative(),
  ourScore: schemaBuilder.number().int().nonnegative(),
  opponentScore: schemaBuilder.number().int().nonnegative(),
});

const matchRulesetResponseSchema = schemaBuilder.object({
  rulesetId: schemaBuilder.string().min(1),
  rulesetKey: schemaBuilder.string().min(1),
  rulesetVersion: schemaBuilder.number().int().nonnegative(),
  name: schemaBuilder.string().min(1),
  gameTo: schemaBuilder.number().int().positive(),
  winBy: schemaBuilder.number().int().positive(),
  hardCap: schemaBuilder.number().int().nullable(),
  softCapMinutes: schemaBuilder.number().int().nullable(),
  softCapPlus: schemaBuilder.number().int().nullable(),
  timeCapMinutes: schemaBuilder.number().int().nullable(),
  halftimeAt: schemaBuilder.number().int().nullable(),
  timeoutsPerTeam: schemaBuilder.number().int().nonnegative(),
  timeoutsPerPeriod: schemaBuilder.number().int().nullable(),
  periods: schemaBuilder.number().int().positive(),
  status: schemaBuilder.enum(['draft', 'active', 'archived']),
});

export const matchRulesetListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(matchRulesetResponseSchema),
  ...pagedEnvelopeFields,
});
