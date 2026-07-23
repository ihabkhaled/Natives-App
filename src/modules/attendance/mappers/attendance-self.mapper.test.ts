import { describe, expect, it } from 'vitest';

import {
  makeParticipationDto,
  makeSelfHistoryDto,
  makeSelfHistoryEntryDto,
  makeSelfRecordDto,
} from '@/tests/msw/attendance-wire.fixture';

import {
  mapAttendanceParticipation,
  mapAttendanceSelfHistory,
  mapAttendanceSelfRecord,
} from './attendance-self.mapper';

describe('mapAttendanceSelfRecord', () => {
  it('renames wire instants and keeps a null eligibility block null', () => {
    const record = mapAttendanceSelfRecord(
      makeSelfRecordDto({
        status: 'present_on_time',
        checkInAt: '2026-07-26T14:58:00.000Z',
        recordedAt: '2026-07-26T14:58:05.000Z',
        source: 'self',
        version: 1,
        selfCheckIn: null,
      }),
    );

    expect(record.status).toBe('present_on_time');
    expect(record.checkInAtIso).toBe('2026-07-26T14:58:00.000Z');
    expect(record.recordedAtIso).toBe('2026-07-26T14:58:05.000Z');
    expect(record.source).toBe('self');
    expect(record.selfCheckIn).toBeNull();
  });

  it('carries the server eligibility block through verbatim', () => {
    const record = mapAttendanceSelfRecord(
      makeSelfRecordDto({
        selfCheckIn: {
          state: 'not_open',
          opensAt: '2026-07-26T14:00:00.000Z',
          closesAt: '2026-07-26T17:00:00.000Z',
        },
      }),
    );

    expect(record.selfCheckIn).toEqual({
      state: 'not_open',
      opensAtIso: '2026-07-26T14:00:00.000Z',
      closesAtIso: '2026-07-26T17:00:00.000Z',
    });
  });
});

describe('mapAttendanceSelfHistory', () => {
  it('renames the wire instants and keeps the page envelope intact', () => {
    const page = mapAttendanceSelfHistory(
      makeSelfHistoryDto({
        items: [
          makeSelfHistoryEntryDto(),
          makeSelfHistoryEntryDto({
            sessionId: 'sess-h-2',
            status: null,
            source: null,
            recordedAt: null,
            sheetState: null,
          }),
        ],
        total: 25,
        limit: 20,
        offset: 0,
      }),
    );

    expect(page.total).toBe(25);
    expect(page.limit).toBe(20);
    expect(page.offset).toBe(0);
    expect(page.items[0]).toEqual({
      sessionId: 'sess-h-1',
      startsAtIso: '2026-07-19T15:00:00.000Z',
      endsAtIso: '2026-07-19T17:00:00.000Z',
      sessionType: 'practice',
      status: 'present_on_time',
      latenessMinutes: null,
      excuseCategory: null,
      source: 'self',
      recordedAtIso: '2026-07-19T14:58:00.000Z',
      sheetState: 'finalized',
    });
    // A never-recorded row stays null across the board — never zero-filled.
    expect(page.items[1]?.status).toBeNull();
    expect(page.items[1]?.recordedAtIso).toBeNull();
    expect(page.items[1]?.sheetState).toBeNull();
  });
});

describe('mapAttendanceParticipation', () => {
  it('projects the counts, nullable rates, and the cited rule untouched', () => {
    const participation = mapAttendanceParticipation(makeParticipationDto());

    expect(participation.onTime).toBe(8);
    expect(participation.attendanceRatePercent).toBe(90.9);
    expect(participation.ruleStatus).toBe('candidate');
    expect(participation.ruleVersion).toBe('attendance-2026-1');
  });

  it('keeps a null rate null — never zero', () => {
    const participation = mapAttendanceParticipation(
      makeParticipationDto({ attendanceRate: null, attendanceRatePercent: null }),
    );

    expect(participation.attendanceRate).toBeNull();
    expect(participation.attendanceRatePercent).toBeNull();
  });
});
