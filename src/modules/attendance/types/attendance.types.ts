import type {
  AttendanceExcuse,
  AttendanceQueueState,
  AttendanceSheetState,
  AttendanceStatus,
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
