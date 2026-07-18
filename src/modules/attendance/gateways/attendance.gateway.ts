import type { BackendApiSchemas } from '@/packages/api-contract';
import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  attendanceBulkPath,
  attendanceCorrectionPath,
  attendanceFinalizePath,
  attendanceHistoryPath,
  attendanceMemberPath,
  attendanceRosterPath,
} from '../constants/attendance-api.constants';
import {
  attendanceHistoryResponseSchema,
  attendanceRecordResponseSchema,
  attendanceSheetResponseSchema,
  attendanceStatusResponseSchema,
  bulkAttendanceResponseSchema,
} from '../schemas/attendance.schema';
import type { AttendanceCorrection, AttendanceMark } from '../types/attendance.types';

type SheetDto = SchemaOutput<typeof attendanceSheetResponseSchema>;
type RecordDto = SchemaOutput<typeof attendanceRecordResponseSchema>;
type BulkDto = SchemaOutput<typeof bulkAttendanceResponseSchema>;
type StatusDto = SchemaOutput<typeof attendanceStatusResponseSchema>;
type HistoryDto = SchemaOutput<typeof attendanceHistoryResponseSchema>;

function toMarkRequest(mark: AttendanceMark): BackendApiSchemas['MarkAttendanceDto'] {
  return {
    status: mark.status,
    ...(mark.latenessMinutes === null ? {} : { latenessMinutes: mark.latenessMinutes }),
    ...(mark.excuseCategory === null ? {} : { excuseCategory: mark.excuseCategory }),
    ...(mark.expectedVersion === null ? {} : { expectedVersion: mark.expectedVersion }),
  };
}

export function requestAttendanceSheet(
  teamId: string,
  sessionId: string,
  limit: number,
  offset: number,
): Promise<SheetDto> {
  return getAppHttpClient().get(
    attendanceRosterPath(teamId, sessionId),
    attendanceSheetResponseSchema,
    { params: { limit, offset } },
  );
}

export function requestBulkAttendance(
  teamId: string,
  sessionId: string,
  marks: readonly AttendanceMark[],
): Promise<BulkDto> {
  const body: BackendApiSchemas['BulkMarkAttendanceDto'] = {
    marks: marks.map((mark) => ({
      membershipId: mark.membershipId,
      ...toMarkRequest(mark),
    })),
  };
  return getAppHttpClient().post(
    attendanceBulkPath(teamId, sessionId),
    body,
    bulkAttendanceResponseSchema,
  );
}

export function requestAttendanceRecord(
  teamId: string,
  sessionId: string,
  mark: AttendanceMark,
): Promise<RecordDto> {
  return getAppHttpClient().put(
    attendanceMemberPath(teamId, sessionId, mark.membershipId),
    toMarkRequest(mark),
    attendanceRecordResponseSchema,
  );
}

export function requestAttendanceFinalization(
  teamId: string,
  sessionId: string,
  expectedVersion: number,
): Promise<StatusDto> {
  const body: BackendApiSchemas['FinalizeAttendanceDto'] = { expectedVersion };
  return getAppHttpClient().post(
    attendanceFinalizePath(teamId, sessionId),
    body,
    attendanceStatusResponseSchema,
  );
}

export function requestAttendanceCorrection(
  teamId: string,
  sessionId: string,
  correction: AttendanceCorrection,
): Promise<RecordDto> {
  const body: BackendApiSchemas['CorrectAttendanceDto'] = {
    ...toMarkRequest(correction),
    reason: correction.reason,
  };
  return getAppHttpClient().put(
    attendanceCorrectionPath(teamId, sessionId, correction.membershipId),
    body,
    attendanceRecordResponseSchema,
  );
}

export function requestAttendanceHistory(
  teamId: string,
  sessionId: string,
  membershipId: string,
): Promise<HistoryDto> {
  return getAppHttpClient().get(
    attendanceHistoryPath(teamId, sessionId, membershipId),
    attendanceHistoryResponseSchema,
  );
}
