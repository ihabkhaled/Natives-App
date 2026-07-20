import type {
  LeaderboardCohort,
  LeaderboardPeriod,
  LedgerEntryType,
  LedgerSourceType,
  RankMovement,
  TieMode,
} from '../constants/points.constants';

/**
 * App-owned points domain. Totals, ranks, tie handling, and badges are all
 * server projections; this module presents them and never recomputes one.
 * `null` means "not known" — a member with no previous rank has `null`, not 0.
 */
export interface CategoryContribution {
  readonly category: string;
  readonly points: number;
}

export interface LeaderboardRow {
  readonly membershipId: string;
  readonly status: string;
  /** Server total. Zero is a real standing and stays on the board. */
  readonly total: number;
  readonly rank: number;
  readonly previousRank: number | null;
  readonly rankDelta: number | null;
  readonly movement: RankMovement;
  readonly badgeCount: number;
  /** The contributing sums behind the total, exactly as the server summed them. */
  readonly contributions: readonly CategoryContribution[];
}

export interface Leaderboard {
  readonly rows: readonly LeaderboardRow[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
  readonly period: LeaderboardPeriod;
  /** The tie-break rule the server applied, displayed verbatim. */
  readonly tieMode: TieMode;
  readonly cohort: LeaderboardCohort;
  readonly category: string | null;
  /** Freshness instant of the projection (UTC ISO 8601). */
  readonly asOfIso: string;
}

export interface LedgerEntry {
  readonly id: string;
  readonly entryType: LedgerEntryType;
  /** Signed amount. A reversal is its own negative entry, never an edit. */
  readonly amount: number;
  readonly sourceType: LedgerSourceType;
  readonly ruleVersion: number | null;
  readonly activityCategory: string | null;
  readonly reason: string | null;
  readonly effectiveOn: string;
  readonly createdAtIso: string;
}

export interface PlayerBadge {
  readonly badgeKey: string;
  readonly threshold: number;
  readonly pointsAtAward: number;
  readonly awardedAtIso: string;
}

export interface PointsSummary {
  readonly membershipId: string;
  readonly total: number;
  readonly entries: readonly LedgerEntry[];
  readonly badges: readonly PlayerBadge[];
}

/** Filter state the leaderboard query is keyed on. */
export interface LeaderboardFilters {
  readonly period: LeaderboardPeriod;
  readonly cohort: LeaderboardCohort;
  readonly category: string | null;
}
