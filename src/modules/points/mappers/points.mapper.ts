import type { SchemaOutput } from '@/packages/schema';

import type {
  leaderboardResponseSchema,
  pointsSummaryResponseSchema,
} from '../schemas/points.schema';
import type { Leaderboard, LeaderboardRow, PointsSummary } from '../types/points.types';

type LeaderboardDto = SchemaOutput<typeof leaderboardResponseSchema>;
type SummaryDto = SchemaOutput<typeof pointsSummaryResponseSchema>;

function mapRow(dto: LeaderboardDto['items'][number]): LeaderboardRow {
  return {
    membershipId: dto.membershipId,
    status: dto.status,
    total: dto.total,
    rank: dto.rank,
    previousRank: dto.previousRank,
    rankDelta: dto.rankDelta,
    movement: dto.movement,
    badgeCount: dto.badgeCount,
    contributions: dto.contributions,
  };
}

/**
 * Pure DTO → domain projection. Row order is preserved exactly as the server
 * ranked it, and every row survives — a zero-total member is never dropped.
 */
export function mapLeaderboard(dto: LeaderboardDto): Leaderboard {
  return {
    rows: dto.items.map(mapRow),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
    period: dto.period,
    tieMode: dto.tieMode,
    cohort: dto.cohort,
    category: dto.category,
    asOfIso: dto.asOf,
  };
}

/** Ledger order is preserved: append-only history, newest handling upstream. */
export function mapPointsSummary(dto: SummaryDto): PointsSummary {
  return {
    membershipId: dto.membershipId,
    total: dto.total,
    entries: dto.entries.map((entry) => ({
      id: entry.id,
      entryType: entry.entryType,
      amount: entry.amount,
      sourceType: entry.sourceType,
      ruleVersion: entry.ruleVersion,
      activityCategory: entry.activityCategory,
      reason: entry.reason,
      effectiveOn: entry.effectiveOn,
      createdAtIso: entry.createdAt,
    })),
    badges: dto.badges.map((badge) => ({
      badgeKey: badge.badgeKey,
      threshold: badge.threshold,
      pointsAtAward: badge.pointsAtAward,
      awardedAtIso: badge.awardedAt,
    })),
  };
}
