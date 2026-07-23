import type { SchemaOutput } from '@/packages/schema';

import type {
  attendanceSelfRecordSchema,
  participationResponseSchema,
} from '../schemas/attendance-self.schema';
import type { AttendanceParticipation, AttendanceSelfRecord } from '../types/attendance.types';

type SelfRecordDto = SchemaOutput<typeof attendanceSelfRecordSchema>;
type ParticipationDto = SchemaOutput<typeof participationResponseSchema>;

export function mapAttendanceSelfRecord(dto: SelfRecordDto): AttendanceSelfRecord {
  const eligibility = dto.selfCheckIn ?? null;
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
      eligibility === null
        ? null
        : {
            state: eligibility.state,
            opensAtIso: eligibility.opensAt,
            closesAtIso: eligibility.closesAt,
          },
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
