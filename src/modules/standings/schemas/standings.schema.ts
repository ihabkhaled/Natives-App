import { isoInstantField, pagedEnvelopeFields, schemaBuilder } from '@/packages/schema';

import {
  STANDING_ENTRANT_KINDS,
  STANDING_QUALIFICATIONS,
  STANDING_RULE_STATUSES,
  STANDING_SOURCES,
  STANDING_TIE_BREAKS,
} from '../constants/standings.constants';

/**
 * Wire contracts for standings tables and versioned point rules, shared by
 * remote NestJS mode and MSW mock mode. `spiritScore` stays nullable — null
 * means "not scored" and is never rendered as zero; `opponentName` arrives
 * denormalized from the server (contract 1.6.0) so the table never invents a
 * name.
 */
export const standingResponseSchema = schemaBuilder.object({
  standingId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().min(1),
  competitionId: schemaBuilder.string().min(1),
  stageId: schemaBuilder.string().nullable(),
  ruleVersionId: schemaBuilder.string().min(1),
  poolLabel: schemaBuilder.string().nullable(),
  entrantKind: schemaBuilder.enum(STANDING_ENTRANT_KINDS),
  opponentId: schemaBuilder.string().nullable(),
  opponentName: schemaBuilder.string().nullable(),
  played: schemaBuilder.number().int().nonnegative(),
  wins: schemaBuilder.number().int().nonnegative(),
  losses: schemaBuilder.number().int().nonnegative(),
  ties: schemaBuilder.number().int().nonnegative(),
  pointsFor: schemaBuilder.number().int().nonnegative(),
  pointsAgainst: schemaBuilder.number().int().nonnegative(),
  standingPoints: schemaBuilder.number().int(),
  spiritScore: schemaBuilder.number().nullable(),
  finalPlace: schemaBuilder.number().int().nullable(),
  qualification: schemaBuilder.enum(STANDING_QUALIFICATIONS),
  source: schemaBuilder.enum(STANDING_SOURCES),
  sourceReference: schemaBuilder.string().nullable(),
  reconciliationNote: schemaBuilder.string().nullable(),
  recordVersion: schemaBuilder.number().int().positive(),
  recordedBy: schemaBuilder.string().nullable(),
  computedAt: isoInstantField,
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const listStandingsResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(standingResponseSchema),
  ...pagedEnvelopeFields,
});

export const standingsRecomputeReportSchema = schemaBuilder.object({
  competitionId: schemaBuilder.string().min(1),
  ruleVersionId: schemaBuilder.string().min(1),
  finalizedMatches: schemaBuilder.number().int().nonnegative(),
  entrants: schemaBuilder.number().int().nonnegative(),
  rows: schemaBuilder.array(standingResponseSchema),
});

export const standingsRuleResponseSchema = schemaBuilder.object({
  ruleVersionId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  ruleKey: schemaBuilder.string().min(1),
  version: schemaBuilder.number().int().positive(),
  name: schemaBuilder.string().min(1),
  winPoints: schemaBuilder.number().int(),
  lossPoints: schemaBuilder.number().int(),
  tiePoints: schemaBuilder.number().int(),
  tieBreakOrder: schemaBuilder.array(schemaBuilder.enum(STANDING_TIE_BREAKS)),
  effectiveFrom: isoInstantField,
  status: schemaBuilder.enum(STANDING_RULE_STATUSES),
  createdBy: schemaBuilder.string().nullable(),
  createdAt: isoInstantField,
});

export const listStandingsRulesResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(standingsRuleResponseSchema),
  ...pagedEnvelopeFields,
});
