import type {
  attendanceHistoryResponseSchema,
  attendanceRecordResponseSchema,
  attendanceSelfRecordSchema,
  attendanceSheetResponseSchema,
  attendanceStatusResponseSchema,
  bulkAttendanceResponseSchema,
  participationResponseSchema,
} from '@/modules/attendance';
import type { SchemaOutput } from '@/packages/schema';

type SheetDto = SchemaOutput<typeof attendanceSheetResponseSchema>;
type RosterEntryDto = SheetDto['items'][number];
type RecordDto = SchemaOutput<typeof attendanceRecordResponseSchema>;
type BulkDto = SchemaOutput<typeof bulkAttendanceResponseSchema>;
type StatusDto = SchemaOutput<typeof attendanceStatusResponseSchema>;
type HistoryDto = SchemaOutput<typeof attendanceHistoryResponseSchema>;
type SelfRecordDto = SchemaOutput<typeof attendanceSelfRecordSchema>;
type ParticipationDto = SchemaOutput<typeof participationResponseSchema>;

const RECORDED_AT = '2026-07-26T15:05:00.000Z';

function makeRosterEntryDto(overrides: Partial<RosterEntryDto> = {}): RosterEntryDto {
  return {
    membershipId: 'm-1',
    userId: 'user-1',
    status: 'present_late',
    checkInAt: '2026-07-26T15:12:00.000Z',
    latenessMinutes: 12,
    excuseCategory: null,
    source: 'coach',
    version: 2,
    ...overrides,
  };
}

export function makeSheetDto(overrides: Partial<SheetDto> = {}): SheetDto {
  return {
    sessionId: 'sess-1',
    state: 'open',
    finalizedAt: null,
    version: 3,
    items: [makeRosterEntryDto()],
    total: 1,
    limit: 100,
    offset: 0,
    ...overrides,
  };
}

export function makeRecordDto(overrides: Partial<RecordDto> = {}): RecordDto {
  return {
    sessionId: 'sess-1',
    membershipId: 'm-1',
    status: 'present_on_time',
    checkInAt: '2026-07-26T14:58:00.000Z',
    checkOutAt: null,
    latenessMinutes: null,
    excuseCategory: null,
    source: 'coach',
    recordedAt: RECORDED_AT,
    version: 4,
    ...overrides,
  };
}

export function makeBulkDto(overrides: Partial<BulkDto> = {}): BulkDto {
  return {
    recorded: 1,
    items: [makeRecordDto()],
    ...overrides,
  };
}

export function makeStatusDto(overrides: Partial<StatusDto> = {}): StatusDto {
  return {
    sessionId: 'sess-1',
    state: 'finalized',
    finalizedAt: '2026-07-26T17:10:00.000Z',
    recordCount: 4,
    version: 5,
    ...overrides,
  };
}

export function makeSelfRecordDto(overrides: Partial<SelfRecordDto> = {}): SelfRecordDto {
  return {
    sessionId: 'sess-1',
    membershipId: 'membership-natives-1',
    status: null,
    checkInAt: null,
    checkOutAt: null,
    latenessMinutes: null,
    excuseCategory: null,
    source: null,
    recordedAt: null,
    version: null,
    ...overrides,
  };
}

export function makeParticipationDto(overrides: Partial<ParticipationDto> = {}): ParticipationDto {
  return {
    membershipId: 'membership-natives-1',
    seasonId: null,
    eligibleSessions: 12,
    excludedSessions: 1,
    denominator: 11,
    attended: 10,
    onTime: 8,
    late: 2,
    excused: 1,
    injured: 0,
    absent: 1,
    remoteApproved: 0,
    otherApproved: 0,
    attendanceRate: 0.9090909090909091,
    attendanceRatePercent: 90.9,
    weightedPresentPoints: 9.5,
    latePenaltyPoints: 0.5,
    absentPenaltyPoints: 1,
    pointsContribution: 8.5,
    ruleVersion: 'attendance-2026-1',
    ruleStatus: 'candidate',
    ...overrides,
  };
}

export function makeHistoryDto(overrides: Partial<HistoryDto> = {}): HistoryDto {
  return {
    items: [
      {
        id: 'rev-1',
        membershipId: 'm-1',
        fromStatus: null,
        toStatus: 'present_on_time',
        latenessMinutes: null,
        excuseCategory: null,
        source: 'coach',
        isCorrection: true,
        correctionReason: 'late scan',
        actorUserId: 'user-coach',
        occurredAt: RECORDED_AT,
      },
    ],
    ...overrides,
  };
}
