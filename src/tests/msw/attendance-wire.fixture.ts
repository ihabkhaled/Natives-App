import type {
  attendanceHistoryResponseSchema,
  attendanceRecordResponseSchema,
  attendanceSheetResponseSchema,
  attendanceStatusResponseSchema,
  bulkAttendanceResponseSchema,
} from '@/modules/attendance/schemas/attendance.schema';
import type { SchemaOutput } from '@/packages/schema';

type SheetDto = SchemaOutput<typeof attendanceSheetResponseSchema>;
type RosterEntryDto = SheetDto['items'][number];
type RecordDto = SchemaOutput<typeof attendanceRecordResponseSchema>;
type BulkDto = SchemaOutput<typeof bulkAttendanceResponseSchema>;
type StatusDto = SchemaOutput<typeof attendanceStatusResponseSchema>;
type HistoryDto = SchemaOutput<typeof attendanceHistoryResponseSchema>;

const RECORDED_AT = '2026-07-26T15:05:00.000Z';

export function makeRosterEntryDto(overrides: Partial<RosterEntryDto> = {}): RosterEntryDto {
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
