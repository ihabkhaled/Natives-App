import type {
  AvailabilitySource,
  AvailabilityValue,
  CompetitionStatus,
  CompetitionType,
  EligibilitySignalCode,
  EligibilityStatus,
  FixtureStatus,
  HomeAway,
  OpponentStatus,
  SelectionRole,
  SelectionStatus,
  SquadStatus,
  SquadTransition,
  StageFormat,
} from '../constants/competitions.constants';

/** App-owned competition domain. Unknown values stay null, never zero. */
export interface Competition {
  readonly competitionId: string;
  readonly name: string;
  readonly competitionType: CompetitionType;
  readonly status: CompetitionStatus;
  readonly genderDivision: string | null;
  readonly organizerName: string | null;
  readonly externalRef: string | null;
  readonly startsOn: string | null;
  readonly endsOn: string | null;
  readonly description: string | null;
  readonly cancellationReason: string | null;
  readonly recordVersion: number;
}

export interface CompetitionPage {
  readonly items: readonly Competition[];
  readonly total: number;
}

interface CompetitionStage {
  readonly stageId: string;
  readonly name: string;
  readonly stageFormat: StageFormat;
  readonly ordinal: number;
}

interface CompetitionRound {
  readonly roundId: string;
  readonly stageId: string;
  readonly name: string;
  readonly ordinal: number;
}

export interface CompetitionStructure {
  readonly stages: readonly CompetitionStage[];
  readonly rounds: readonly CompetitionRound[];
}

export interface Fixture {
  readonly fixtureId: string;
  readonly opponentId: string;
  readonly stageId: string | null;
  readonly roundId: string | null;
  readonly venueId: string | null;
  readonly homeAway: HomeAway;
  readonly scheduledAt: string;
  readonly status: FixtureStatus;
  readonly rescheduleCount: number;
  readonly rescheduleReason: string | null;
  readonly cancellationReason: string | null;
}

export interface FixturePage {
  readonly items: readonly Fixture[];
  readonly total: number;
}

export interface Opponent {
  readonly opponentId: string;
  readonly name: string;
  readonly shortName: string | null;
  readonly notes: string | null;
  readonly status: OpponentStatus;
}

export interface OpponentPage {
  readonly items: readonly Opponent[];
  readonly total: number;
}

export interface Squad {
  readonly squadId: string;
  readonly competitionId: string | null;
  readonly name: string;
  readonly status: SquadStatus;
  readonly attendanceThresholdPct: number;
  readonly policyVersion: string;
  readonly selectionDeadline: string | null;
  readonly notes: string | null;
  readonly revision: number;
  readonly recordVersion: number;
}

export interface SquadPage {
  readonly items: readonly Squad[];
  readonly total: number;
}

interface EligibilitySignal {
  readonly code: EligibilitySignalCode;
  readonly status: EligibilityStatus;
}

/**
 * One candidate in the advisory eligibility report. `attendancePct`,
 * `jerseyNumber`, and `availability` are null when the backend has nothing to
 * report — the UI must say so rather than substitute a number.
 */
export interface EligibilityCandidate {
  readonly membershipId: string;
  readonly fullName: string;
  readonly jerseyNumber: number | null;
  readonly attendancePct: number | null;
  readonly availability: AvailabilityValue | null;
  readonly selected: boolean;
  readonly signals: readonly EligibilitySignal[];
  readonly overall: EligibilityStatus;
  readonly flagged: boolean;
}

export interface GenderRatio {
  readonly men: number;
  readonly women: number;
  readonly mixed: number;
  readonly unknown: number;
  readonly total: number;
  readonly balanced: boolean;
}

export interface EligibilityReport {
  readonly squadId: string;
  readonly policyVersion: string;
  readonly attendanceThresholdPct: number;
  readonly candidates: readonly EligibilityCandidate[];
  readonly selectedGenderRatio: GenderRatio;
  readonly total: number;
}

export interface SquadSelection {
  readonly selectionId: string;
  readonly membershipId: string;
  readonly selectionRole: SelectionRole;
  readonly status: SelectionStatus;
  readonly eligibilityOverridden: boolean;
  readonly overrideReason: string | null;
  readonly recordVersion: number;
}

export interface SquadSelectionPage {
  readonly items: readonly SquadSelection[];
  readonly total: number;
}

export interface SquadAvailability {
  readonly availabilityId: string;
  readonly membershipId: string;
  readonly availability: AvailabilityValue;
  readonly reason: string | null;
  readonly source: AvailabilitySource;
  readonly updatedAt: string;
}

export interface SquadAvailabilityPage {
  readonly items: readonly SquadAvailability[];
  readonly total: number;
}

/** Commands the squad workspace sends. Reasons are never optional-by-accident. */
export interface SelectPlayerCommand {
  readonly membershipId: string;
  readonly selectionRole: SelectionRole;
  readonly reason: string | null;
}

export interface OverrideSelectPlayerCommand extends SelectPlayerCommand {
  readonly overrideReason: string;
}

export interface DeclareAvailabilityCommand {
  readonly availability: AvailabilityValue;
  readonly reason: string | null;
}

export interface TransitionSquadCommand {
  readonly transition: SquadTransition;
  readonly expectedRecordVersion: number;
}
