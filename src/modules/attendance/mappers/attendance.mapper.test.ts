import { describe, expect, it } from 'vitest';

import {
  makeBulkDto,
  makeHistoryDto,
  makeRecordDto,
  makeSheetDto,
  makeStatusDto,
} from '@/tests/msw/attendance-wire.fixture';

import {
  mapAttendanceBulkResult,
  mapAttendanceFinalization,
  mapAttendanceHistory,
  mapAttendanceRecord,
  mapAttendanceSheet,
} from './attendance.mapper';

describe('mapAttendanceSheet', () => {
  it('projects the wire sheet into the domain roster, dropping private fields', () => {
    const sheet = mapAttendanceSheet(makeSheetDto());

    expect(sheet).toEqual({
      sessionId: 'sess-1',
      state: 'open',
      finalizedAtIso: null,
      version: 3,
      total: 1,
      items: [
        {
          membershipId: 'm-1',
          userId: 'user-1',
          status: 'present_late',
          checkInAtIso: '2026-07-26T15:12:00.000Z',
          latenessMinutes: 12,
          excuseCategory: null,
          version: 2,
        },
      ],
    });
  });
});

describe('mapAttendanceRecord', () => {
  it('keeps only the authoritative mark fields', () => {
    expect(mapAttendanceRecord(makeRecordDto())).toEqual({
      membershipId: 'm-1',
      status: 'present_on_time',
      version: 4,
      recordedAtIso: '2026-07-26T15:05:00.000Z',
    });
  });
});

describe('mapAttendanceBulkResult', () => {
  it('maps each recorded item and the recorded count', () => {
    const result = mapAttendanceBulkResult(
      makeBulkDto({ recorded: 1, items: [makeRecordDto({ status: 'absent' })] }),
    );

    expect(result.recorded).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.status).toBe('absent');
  });
});

describe('mapAttendanceFinalization', () => {
  it('maps the finalized status projection', () => {
    expect(mapAttendanceFinalization(makeStatusDto())).toEqual({
      state: 'finalized',
      finalizedAtIso: '2026-07-26T17:10:00.000Z',
      recordCount: 4,
      version: 5,
    });
  });
});

describe('mapAttendanceHistory', () => {
  it('maps each revision preserving null-not-zero transitions', () => {
    expect(mapAttendanceHistory(makeHistoryDto())).toEqual([
      {
        id: 'rev-1',
        fromStatus: null,
        toStatus: 'present_on_time',
        latenessMinutes: null,
        excuseCategory: null,
        correctionReason: 'late scan',
        occurredAtIso: '2026-07-26T15:05:00.000Z',
      },
    ]);
  });
});
