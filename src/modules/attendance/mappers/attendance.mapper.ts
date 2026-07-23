import type { SchemaOutput } from '@/packages/schema';

import type {
  attendanceHistoryResponseSchema,
  attendanceRecordResponseSchema,
  attendanceSheetResponseSchema,
  attendanceStatusResponseSchema,
  bulkAttendanceResponseSchema,
} from '../schemas/attendance.schema';
import type {
  AttendanceBulkResult,
  AttendanceFinalization,
  AttendanceRecord,
  AttendanceRevision,
  AttendanceSheet,
} from '../types/attendance.types';

type SheetDto = SchemaOutput<typeof attendanceSheetResponseSchema>;
type RecordDto = SchemaOutput<typeof attendanceRecordResponseSchema>;
type BulkDto = SchemaOutput<typeof bulkAttendanceResponseSchema>;
type StatusDto = SchemaOutput<typeof attendanceStatusResponseSchema>;
type HistoryDto = SchemaOutput<typeof attendanceHistoryResponseSchema>;

export function mapAttendanceSheet(dto: SheetDto): AttendanceSheet {
  return {
    sessionId: dto.sessionId,
    state: dto.state,
    finalizedAtIso: dto.finalizedAt,
    version: dto.version,
    items: dto.items.map((item) => ({
      membershipId: item.membershipId,
      userId: item.userId,
      displayName: item.displayName,
      rsvpStatus: item.rsvpStatus,
      status: item.status,
      checkInAtIso: item.checkInAt,
      latenessMinutes: item.latenessMinutes,
      excuseCategory: item.excuseCategory,
      version: item.version,
    })),
    total: dto.total,
  };
}

export function mapAttendanceRecord(dto: RecordDto): AttendanceRecord {
  return {
    membershipId: dto.membershipId,
    status: dto.status,
    version: dto.version,
    recordedAtIso: dto.recordedAt,
  };
}

export function mapAttendanceBulkResult(dto: BulkDto): AttendanceBulkResult {
  return {
    recorded: dto.recorded,
    items: dto.items.map(mapAttendanceRecord),
  };
}

export function mapAttendanceFinalization(dto: StatusDto): AttendanceFinalization {
  return {
    state: dto.state,
    finalizedAtIso: dto.finalizedAt,
    recordCount: dto.recordCount,
    version: dto.version,
  };
}

export function mapAttendanceHistory(dto: HistoryDto): readonly AttendanceRevision[] {
  return dto.items.map((item) => ({
    id: item.id,
    fromStatus: item.fromStatus,
    toStatus: item.toStatus,
    latenessMinutes: item.latenessMinutes,
    excuseCategory: item.excuseCategory,
    correctionReason: item.correctionReason,
    occurredAtIso: item.occurredAt,
  }));
}
