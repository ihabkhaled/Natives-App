import { schemaBuilder } from '@/packages/schema';

import {
  LEADERBOARD_COHORTS,
  LEADERBOARD_PERIODS,
  LEDGER_ENTRY_TYPES,
  LEDGER_SOURCE_TYPES,
} from '../constants/points.constants';

/**
 * Wire contracts for the backend points module, shared by remote NestJS mode
 * and MSW mock mode. A zero total is a real, meaningful value here — a member
 * with no contributions still appears with 0 and must never be filtered out.
 * `previousRank`, `rankDelta`, and `ruleVersion` stay nullable: unknown is
 * unknown, never zero.
 */
const isoInstant = schemaBuilder.iso.datetime({ offset: true });
const isoDate = schemaBuilder.string().regex(/^\d{4}-\d{2}-\d{2}$/u);

const categoryContributionSchema = schemaBuilder.object({
  category: schemaBuilder.string().min(1),
  points: schemaBuilder.number(),
});

const leaderboardRowResponseSchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
  status: schemaBuilder.string().min(1),
  total: schemaBuilder.number(),
  rank: schemaBuilder.number().int().positive(),
  previousRank: schemaBuilder.number().int().nullable(),
  rankDelta: schemaBuilder.number().int().nullable(),
  movement: schemaBuilder.enum(['up', 'down', 'steady', 'none']),
  badgeCount: schemaBuilder.number().int().nonnegative(),
  contributions: schemaBuilder.array(categoryContributionSchema),
});

export const leaderboardResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(leaderboardRowResponseSchema),
  total: schemaBuilder.number().int().nonnegative(),
  limit: schemaBuilder.number().int().positive(),
  offset: schemaBuilder.number().int().nonnegative(),
  period: schemaBuilder.enum(LEADERBOARD_PERIODS),
  tieMode: schemaBuilder.enum(['competition', 'dense', 'ordinal']),
  cohort: schemaBuilder.enum(LEADERBOARD_COHORTS),
  category: schemaBuilder.string().nullable(),
  asOf: isoInstant,
});

const ledgerEntryResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  entryType: schemaBuilder.enum(LEDGER_ENTRY_TYPES),
  amount: schemaBuilder.number(),
  sourceType: schemaBuilder.enum(LEDGER_SOURCE_TYPES),
  ruleVersion: schemaBuilder.number().int().nullable(),
  activityCategory: schemaBuilder.string().nullable(),
  reason: schemaBuilder.string().nullable(),
  effectiveOn: isoDate,
  createdAt: isoInstant,
});

const playerBadgeResponseSchema = schemaBuilder.object({
  badgeKey: schemaBuilder.string().min(1),
  threshold: schemaBuilder.number(),
  pointsAtAward: schemaBuilder.number(),
  awardedAt: isoInstant,
});

export const pointsSummaryResponseSchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
  total: schemaBuilder.number(),
  entries: schemaBuilder.array(ledgerEntryResponseSchema),
  badges: schemaBuilder.array(playerBadgeResponseSchema),
});
