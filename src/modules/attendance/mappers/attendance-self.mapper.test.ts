import { describe, expect, it } from 'vitest';

import { makeParticipationDto, makeSelfRecordDto } from '@/tests/msw/attendance-wire.fixture';

import { mapAttendanceParticipation, mapAttendanceSelfRecord } from './attendance-self.mapper';

describe('mapAttendanceSelfRecord', () => {
  it('renames wire instants and defaults the absent eligibility block to null', () => {
    const record = mapAttendanceSelfRecord(
      makeSelfRecordDto({
        status: 'present_on_time',
        checkInAt: '2026-07-26T14:58:00.000Z',
        recordedAt: '2026-07-26T14:58:05.000Z',
        source: 'self',
        version: 1,
      }),
    );

    expect(record.status).toBe('present_on_time');
    expect(record.checkInAtIso).toBe('2026-07-26T14:58:00.000Z');
    expect(record.recordedAtIso).toBe('2026-07-26T14:58:05.000Z');
    expect(record.source).toBe('self');
    expect(record.selfCheckIn).toBeNull();
  });

  it('carries the server eligibility block through when it ships (Wave B1)', () => {
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
