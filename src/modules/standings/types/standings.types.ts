import type {
  StandingEntrantKind,
  StandingQualification,
  StandingRuleStatus,
  StandingSource,
  StandingTieBreak,
} from '../constants/standings.constants';

/** One entrant's row in a competition standings table, as the server ranked it. */
export interface StandingRow {
  readonly standingId: string;
  readonly seasonId: string;
  readonly competitionId: string;
  readonly stageId: string | null;
  readonly ruleVersionId: string;
  readonly poolLabel: string | null;
  readonly entrantKind: StandingEntrantKind;
  readonly opponentId: string | null;
  readonly opponentName: string | null;
  readonly played: number;
  readonly wins: number;
  readonly losses: number;
  readonly ties: number;
  readonly pointsFor: number;
  readonly pointsAgainst: number;
  readonly standingPoints: number;
  readonly spiritScore: number | null;
  readonly finalPlace: number | null;
  readonly qualification: StandingQualification;
  readonly source: StandingSource;
  readonly sourceReference: string | null;
  readonly reconciliationNote: string | null;
  readonly recordVersion: number;
  readonly recordedBy: string | null;
  readonly computedAtIso: string;
}

export interface StandingsPage {
  readonly rows: readonly StandingRow[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

/** Facets of the standings table read; null keeps a facet unfiltered. */
export interface StandingsFilters {
  readonly competitionId: string;
  readonly source: StandingSource | null;
}

export interface StandingsRecomputeReport {
  readonly competitionId: string;
  readonly ruleVersionId: string;
  readonly finalizedMatches: number;
  readonly entrants: number;
}

export interface RecomputeStandingsCommand {
  readonly competitionId: string;
  readonly ruleKey: string;
}

export interface RecordManualStandingCommand {
  readonly competitionId: string;
  readonly entrantKind: StandingEntrantKind;
  readonly opponentId: string | null;
  readonly played: number;
  readonly wins: number;
  readonly losses: number;
  readonly ties: number;
  readonly pointsFor: number;
  readonly pointsAgainst: number;
  readonly spiritScore: number | null;
  readonly finalPlace: number | null;
  readonly qualification: StandingQualification | null;
  readonly sourceReference: string | null;
  readonly reconciliationNote: string;
  readonly ruleKey: string;
}

/** A named, versioned point rule. Immutable once published. */
export interface StandingsRule {
  readonly ruleVersionId: string;
  readonly ruleKey: string;
  readonly version: number;
  readonly name: string;
  readonly winPoints: number;
  readonly lossPoints: number;
  readonly tiePoints: number;
  readonly tieBreakOrder: readonly StandingTieBreak[];
  readonly effectiveFromIso: string;
  readonly status: StandingRuleStatus;
}

export interface StandingsRulesPage {
  readonly rules: readonly StandingsRule[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

export interface CreateStandingsRuleCommand {
  readonly ruleKey: string;
  readonly name: string;
  readonly winPoints: number;
  readonly lossPoints: number;
  readonly tiePoints: number;
  readonly tieBreakOrder: readonly StandingTieBreak[];
}
