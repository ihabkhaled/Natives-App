import type {
  AttendanceExcuse,
  AttendanceQueueState,
  AttendanceSheetState,
  AttendanceSource,
  AttendanceStatus,
  SelfCheckInState,
} from '../constants/attendance.constants';

export interface AttendanceRosterEntry {
  readonly membershipId: string;
  readonly userId: string | null;
  readonly status: AttendanceStatus | null;
  readonly checkInAtIso: string | null;
  readonly latenessMinutes: number | null;
  readonly excuseCategory: AttendanceExcuse | null;
  readonly version: number | null;
}

export interface AttendanceSheet {
  readonly sessionId: string;
  readonly state: AttendanceSheetState;
  readonly finalizedAtIso: string | null;
  readonly version: number | null;
  readonly items: readonly AttendanceRosterEntry[];
  readonly total: number;
}

export interface AttendanceMark {
  readonly membershipId: string;
  readonly status: AttendanceStatus;
  readonly latenessMinutes: number | null;
  readonly excuseCategory: AttendanceExcuse | null;
  readonly expectedVersion: number | null;
}

export interface AttendanceDraft {
  readonly status: AttendanceStatus | null;
  readonly latenessMinutes: number | null;
  readonly excuseCategory: AttendanceExcuse | null;
  readonly expectedVersion: number | null;
  readonly correctionReason: string;
}

export interface AttendanceRecord {
  readonly membershipId: string;
  readonly status: AttendanceStatus | null;
  readonly version: number | null;
  readonly recordedAtIso: string | null;
}

export interface AttendanceBulkResult {
  readonly recorded: number;
  readonly items: readonly AttendanceRecord[];
}

export interface AttendanceFinalization {
  readonly state: AttendanceSheetState;
  readonly finalizedAtIso: string | null;
  readonly recordCount: number;
  readonly version: number;
}

export interface AttendanceCorrection extends AttendanceMark {
  readonly reason: string;
}

export interface AttendanceRevision {
  readonly id: string;
  readonly fromStatus: AttendanceStatus | null;
  readonly toStatus: AttendanceStatus;
  readonly latenessMinutes: number | null;
  readonly excuseCategory: AttendanceExcuse | null;
  readonly correctionReason: string | null;
  readonly occurredAtIso: string;
}

export interface AttendanceQueuedOperation extends AttendanceMark {
  readonly operationId: string;
  readonly teamId: string;
  readonly sessionId: string;
  readonly state: AttendanceQueueState;
  readonly retryCount: number;
  readonly createdAtIso: string;
}

export interface AttendanceQueueReplayResult {
  readonly succeededOperationIds: readonly string[];
  readonly conflictOperationIds: readonly string[];
  readonly failedOperationIds: readonly string[];
}

/** Server-resolved check-in eligibility (Wave B1); absent until it ships. */
interface AttendanceSelfCheckInWindow {
  readonly state: SelfCheckInState;
  readonly opensAtIso: string | null;
  readonly closesAtIso: string | null;
}

/** The caller's own record for one session; `status: null` = not recorded. */
export interface AttendanceSelfRecord {
  readonly sessionId: string;
  readonly membershipId: string;
  readonly status: AttendanceStatus | null;
  readonly checkInAtIso: string | null;
  readonly latenessMinutes: number | null;
  readonly excuseCategory: AttendanceExcuse | null;
  readonly source: AttendanceSource | null;
  readonly recordedAtIso: string | null;
  readonly version: number | null;
  readonly selfCheckIn: AttendanceSelfCheckInWindow | null;
}

/**
 * Own weighted-participation summary over finalized sessions only. Null rates
 * mean "not enough data" — never zero.
 */
export interface AttendanceParticipation {
  readonly membershipId: string;
  readonly seasonId: string | null;
  readonly eligibleSessions: number;
  readonly excludedSessions: number;
  readonly denominator: number;
  readonly attended: number;
  readonly onTime: number;
  readonly late: number;
  readonly excused: number;
  readonly injured: number;
  readonly absent: number;
  readonly remoteApproved: number;
  readonly otherApproved: number;
  readonly attendanceRate: number | null;
  readonly attendanceRatePercent: number | null;
  readonly ruleVersion: string;
  readonly ruleStatus: 'candidate' | 'approved';
}
