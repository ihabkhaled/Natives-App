/**
 * Wire shapes for the public "season showcase" read model described in the
 * landing-site spec: a bounded, publishable projection over the existing
 * competitions / matches / standings / points modules.
 *
 * These are the DTOs the backend contract 1.8.0 endpoints are expected to
 * return:
 *
 *   GET /public/showcase/competitions          -> PublicCompetitionSummaryDto[]
 *   GET /public/showcase/competitions/{slug}   -> PublicCompetitionDetailDto
 *
 * They are declared here — ahead of the generated contract types — so the
 * screens, mappers, and tests are already written against the real shape.
 * When 1.8.0 lands in `contracts/openapi.json`, these interfaces are replaced
 * by (or narrowed to) the generated equivalents and the two service files in
 * `services/` become gateway calls. Nothing else moves.
 */

/** A competition the team entered, plus the team's finish when it is known. */
export interface PublicCompetitionSummaryDto {
  /** Stable, URL-safe identifier used as the public route segment. */
  readonly slug: string;
  readonly name: string;
  readonly year: number;
  /** e.g. `mixed-outdoor`; null until the organiser publishes it. */
  readonly format: string | null;
  readonly location: string | null;
  readonly startDate: string | null;
  readonly endDate: string | null;
  /** The team's finishing place; null while the event is unfinished/unpublished. */
  readonly rank: number | null;
  /** Field size the rank is measured against; null when not published. */
  readonly entrantCount: number | null;
}

/** One publishable player line from a match: no PII beyond the display name. */
export interface PublicPlayerScoreDto {
  readonly playerId: string;
  readonly displayName: string;
  readonly jerseyNumber: number | null;
  readonly goals: number;
  readonly assists: number;
  readonly blocks: number;
}

/** One match result inside a competition. */
export interface PublicMatchResultDto {
  readonly matchId: string;
  readonly opponentName: string;
  /** ISO instant; null when the fixture has no confirmed slot yet. */
  readonly playedAt: string | null;
  /** Both scores are null together until the match is scored. */
  readonly ourScore: number | null;
  readonly opponentScore: number | null;
  readonly playerScores: readonly PublicPlayerScoreDto[];
}

/** One row of the per-competition individual leaderboard. */
export interface PublicLeaderboardEntryDto {
  readonly playerId: string;
  readonly displayName: string;
  /** Server-assigned rank; the client never re-ranks. */
  readonly rank: number;
  readonly points: number;
}

/** Everything one public competition page renders. */
export interface PublicCompetitionDetailDto {
  readonly competition: PublicCompetitionSummaryDto;
  readonly matches: readonly PublicMatchResultDto[];
  readonly leaderboard: readonly PublicLeaderboardEntryDto[];
}
