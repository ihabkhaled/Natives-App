import type { AvailabilityValue } from '../constants/competitions.constants';
import type {
  EntryRole,
  EntryStatus,
  FieldPosition,
  GenderBucket,
  LineAssignment,
  RosterDivision,
  RosterKind,
  RosterStatus,
  RosterTransition,
  SnapshotReason,
  ViolationCode,
  ViolationSeverity,
} from '../constants/rosters.constants';

export interface Roster {
  readonly rosterId: string;
  readonly competitionId: string;
  readonly fixtureId: string | null;
  readonly squadId: string | null;
  readonly rosterKind: RosterKind;
  readonly name: string;
  readonly status: RosterStatus;
  readonly division: RosterDivision;
  readonly minSize: number;
  readonly maxSize: number;
  readonly minWomen: number | null;
  readonly requireCaptain: boolean;
  readonly policyVersion: string;
  readonly selectionDeadline: string | null;
  readonly notes: string | null;
  readonly revision: number;
  readonly recordVersion: number;
  readonly revisionReason: string | null;
  readonly lockedAt: string | null;
}

export interface RosterPage {
  readonly items: readonly Roster[];
  readonly total: number;
}

/**
 * One rostered player. A missing jersey or an undeclared availability stays
 * null so the table can say so instead of printing a zero.
 */
export interface RosterEntry {
  readonly entryId: string;
  readonly membershipId: string;
  readonly jerseyNumber: number | null;
  readonly entryRole: EntryRole;
  readonly lineAssignment: LineAssignment;
  readonly fieldPosition: FieldPosition;
  readonly genderBucket: GenderBucket;
  readonly status: EntryStatus;
  readonly availability: AvailabilityValue | null;
  readonly constraintOverridden: boolean;
  readonly overrideReason: string | null;
  readonly recordVersion: number;
}

export interface RosterEntryPage {
  readonly items: readonly RosterEntry[];
  readonly total: number;
}

export interface RosterComposition {
  readonly selected: number;
  readonly women: number;
  readonly men: number;
  readonly mixed: number;
  readonly unknownGender: number;
  readonly offense: number;
  readonly defense: number;
  readonly flexible: number;
  readonly captains: number;
  readonly spiritCaptains: number;
  readonly missingJersey: number;
  readonly duplicateJerseys: number;
  readonly unavailableSelected: number;
}

interface RosterViolation {
  readonly code: ViolationCode;
  readonly severity: ViolationSeverity;
  readonly count: number | null;
}

export interface RosterValidation {
  readonly rosterId: string;
  readonly policyVersion: string;
  readonly status: RosterStatus;
  readonly composition: RosterComposition;
  readonly violations: readonly RosterViolation[];
  readonly publishable: boolean;
}

export interface RosterSnapshot {
  readonly snapshotId: string;
  readonly revision: number;
  readonly reason: SnapshotReason;
  readonly rosterStatus: RosterStatus;
  readonly entryCount: number;
  readonly takenAt: string;
}

export interface RosterSnapshotPage {
  readonly items: readonly RosterSnapshot[];
  readonly total: number;
}

export interface RemoveRosterEntryCommand {
  readonly membershipId: string;
  readonly reason: string | null;
}

export interface RosterLifecycleCommand {
  readonly intent: RosterTransition | 'lock';
  readonly expectedRecordVersion: number;
}
