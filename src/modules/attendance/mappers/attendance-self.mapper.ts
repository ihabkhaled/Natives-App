import type { SchemaOutput } from '@/packages/schema';

import type {
  attendanceSelfHistoryResponseSchema,
  attendanceSelfRecordSchema,
  participationResponseSchema,
} from '../schemas/attendance-self.schema';
import type {
  AttendanceParticipation,
  AttendanceSelfHistoryPage,
  AttendanceSelfRecord,
} from '../types/attendance.types';

type SelfRecordDto = SchemaOutput<typeof attendanceSelfRecordSchema>;
type ParticipationDto = SchemaOutput<typeof participationResponseSchema>;
type SelfHistoryDto = SchemaOutput<typeof attendanceSelfHistoryResponseSchema>;

export function mapAttendanceSelfRecord(dto: SelfRecordDto): AttendanceSelfRecord {
  return {
    sessionId: dto.sessionId,
    membershipId: dto.membershipId,
    status: dto.status,
    checkInAtIso: dto.checkInAt,
    latenessMinutes: dto.latenessMinutes,
    excuseCategory: dto.excuseCategory,
    source: dto.source,
    recordedAtIso: dto.recordedAt,
    version: dto.version,
    selfCheckIn:
      dto.selfCheckIn === null
        ? null
        : {
            state: dto.selfCheckIn.state,
            opensAtIso: dto.selfCheckIn.opensAt,
            closesAtIso: dto.selfCheckIn.closesAt,
          },
  };
}

export function mapAttendanceSelfHistory(dto: SelfHistoryDto): AttendanceSelfHistoryPage {
  return {
    items: dto.items.map((item) => ({
      sessionId: item.sessionId,
      startsAtIso: item.startsAt,
      endsAtIso: item.endsAt,
      sessionType: item.sessionType,
      status: item.status,
      latenessMinutes: item.latenessMinutes,
      excuseCategory: item.excuseCategory,
      source: item.source,
      recordedAtIso: item.recordedAt,
      sheetState: item.sheetState,
    })),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
  };
}

export function mapAttendanceParticipation(dto: ParticipationDto): AttendanceParticipation {
  return {
    membershipId: dto.membershipId,
    seasonId: dto.seasonId,
    eligibleSessions: dto.eligibleSessions,
    excludedSessions: dto.excludedSessions,
    denominator: dto.denominator,
    attended: dto.attended,
    onTime: dto.onTime,
    late: dto.late,
    excused: dto.excused,
    injured: dto.injured,
    absent: dto.absent,
    remoteApproved: dto.remoteApproved,
    otherApproved: dto.otherApproved,
    attendanceRate: dto.attendanceRate,
    attendanceRatePercent: dto.attendanceRatePercent,
    ruleVersion: dto.ruleVersion,
    ruleStatus: dto.ruleStatus,
  };
}
