import type {
  MatchOperationOutcome,
  MatchStatus,
  MatchTransition,
  ScorekeeperOperationKind,
  ScorekeeperQueueState,
  ScoringSide,
} from '../constants/matches.constants';

export type { MatchOperationOutcome, ScorekeeperOperationKind };

export type MatchResult = 'win' | 'loss' | 'draw' | 'undecided';
export type MatchCap = 'none' | 'soft' | 'hard' | 'time';
export type MatchEventType =
  'point' | 'timeout' | 'period_start' | 'period_end' | 'cap_applied' | 'void';

export interface Match {
  readonly matchId: string;
  readonly competitionId: string;
  readonly fixtureId: string;
  readonly rosterId: string | null;
  readonly rulesetId: string;
  readonly status: MatchStatus;
  readonly homeAway: string;
  readonly ourScore: number;
  readonly opponentScore: number;
  readonly period: number;
  readonly streamVersion: number;
  readonly recordVersion: number;
  readonly result: MatchResult;
  readonly capApplied: MatchCap;
  readonly startedAt: string | null;
  readonly finalizedAt: string | null;
}

export interface MatchPage {
  readonly items: readonly Match[];
  readonly total: number;
}

interface MatchTimeoutState {
  readonly allowance: number;
  readonly remainingForUs: number;
  readonly remainingForThem: number;
}

export interface MatchScoreboard {
  readonly matchId: string;
  readonly status: MatchStatus;
  readonly ourScore: number;
  readonly opponentScore: number;
  readonly period: number;
  readonly streamVersion: number;
  readonly recordVersion: number;
  readonly result: MatchResult;
  readonly rulesetKey: string;
  readonly rulesetVersion: number;
  readonly target: number;
  readonly capApplied: MatchCap;
  readonly complete: boolean;
  readonly halftimeReached: boolean;
  readonly scoringOpen: boolean;
  readonly timeouts: MatchTimeoutState;
}

export interface MatchEvent {
  readonly eventId: string;
  readonly sequence: number;
  readonly operationId: string;
  readonly eventType: MatchEventType;
  readonly scoringSide: ScoringSide | null;
  readonly points: number | null;
  readonly ourScoreAfter: number;
  readonly opponentScoreAfter: number;
  readonly period: number;
  readonly scorerMembershipId: string | null;
  readonly voidsEventId: string | null;
  readonly voided: boolean;
  readonly voidReason: string | null;
  readonly recordedAt: string;
}

export interface MatchRuleset {
  readonly rulesetId: string;
  readonly rulesetKey: string;
  readonly rulesetVersion: number;
  readonly name: string;
  readonly gameTo: number;
  readonly winBy: number;
  readonly hardCap: number | null;
  readonly softCapMinutes: number | null;
  readonly softCapPlus: number | null;
  readonly timeCapMinutes: number | null;
  readonly halftimeAt: number | null;
  readonly timeoutsPerTeam: number;
  readonly periods: number;
}

/** The authoritative answer to one idempotent scorekeeper command. */
export interface MatchOperationResult {
  readonly outcome: MatchOperationOutcome;
  readonly eventId: string;
  readonly operationId: string;
  readonly streamVersion: number;
  readonly ourScore: number;
  readonly opponentScore: number;
}

interface PointCommandPayload {
  readonly kind: 'point';
  readonly scoringSide: ScoringSide;
  readonly scorerMembershipId: string | null;
  readonly assistMembershipId: string | null;
}

interface TimeoutCommandPayload {
  readonly kind: 'timeout';
  readonly scoringSide: ScoringSide;
}

interface VoidCommandPayload {
  readonly kind: 'void';
  readonly eventId: string;
  readonly reason: string;
}

export type ScorekeeperPayload = PointCommandPayload | TimeoutCommandPayload | VoidCommandPayload;

/**
 * One queued scorekeeper command.
 *
 * `operationId` is generated once, on the field, and never regenerated: the
 * backend keys idempotency on it. `payloadFingerprint` is recorded next to it
 * so a same-id/different-payload submission is recognizable as the 409 the
 * backend will raise rather than something the client silently merges.
 * `ownerUserId` scopes the queue to the account that recorded it.
 */
export interface ScorekeeperQueuedOperation {
  readonly operationId: string;
  readonly ownerUserId: string;
  readonly teamId: string;
  readonly matchId: string;
  readonly kind: ScorekeeperOperationKind;
  readonly payload: ScorekeeperPayload;
  readonly payloadFingerprint: string;
  readonly baseStreamVersion: number;
  readonly state: ScorekeeperQueueState;
  readonly retryCount: number;
  readonly conflictServerScore: string | null;
  readonly createdAtIso: string;
}

export type ScorekeeperEnqueueOutcome = 'accepted' | 'at-limit';

/**
 * What one recorded action ended up as. `replayed` is a success that did not
 * move the score; `blocked-at-limit` means the action was never accepted,
 * because the bounded queue refuses to drop anything.
 */
export type ScorekeeperActionStatus =
  'blocked-at-limit' | 'queued' | MatchOperationOutcome | 'failed';

export interface ScorekeeperActionResult {
  readonly status: ScorekeeperActionStatus;
  readonly operationId: string;
}

export interface ScorekeeperReplayResult {
  readonly appliedOperationIds: readonly string[];
  readonly replayedOperationIds: readonly string[];
  readonly conflictOperationIds: readonly string[];
  readonly failedOperationIds: readonly string[];
}

export interface MatchTransitionCommand {
  readonly transition: MatchTransition;
  readonly expectedRecordVersion: number;
}

export interface FinalizeMatchCommand {
  readonly expectedRecordVersion: number;
}

export interface PlayerMatchStatistics {
  readonly membershipId: string;
  readonly rostered: boolean;
  readonly pointsPlayed: number | null;
  readonly offencePointsPlayed: number | null;
  readonly defencePointsPlayed: number | null;
  readonly goals: number | null;
  readonly assists: number | null;
  readonly callahans: number | null;
  readonly drops: number | null;
  readonly throwaways: number | null;
  readonly blocks: number | null;
}

export interface TeamMatchStatistics {
  readonly pointsStarted: number;
  readonly pointsCompleted: number;
  readonly holds: number;
  readonly breaks: number;
  readonly opponentHolds: number;
  readonly opponentBreaks: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly turnovers: number | null;
  readonly opponentErrors: number | null;
}

export interface MatchStatistics {
  readonly matchId: string;
  readonly rulesetKey: string;
  readonly rulesetVersion: number;
  readonly statsEngineVersion: string;
  readonly lineupsRecorded: boolean;
  readonly playsRecorded: boolean;
  readonly opponentErrorAttribution: boolean;
  readonly team: TeamMatchStatistics;
  readonly players: readonly PlayerMatchStatistics[];
}
