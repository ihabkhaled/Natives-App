import { describe, expect, it, vi } from 'vitest';

import { makeSelfHistoryDto } from '@/tests/msw/attendance-wire.fixture';

import { mapAttendanceSelfHistory } from '../mappers/attendance-self.mapper';
import { getMyAttendance } from '../services/get-my-attendance.service';
import { getMyAttendanceHistory } from '../services/get-my-attendance-history.service';
import { getMyParticipation } from '../services/get-my-participation.service';
import {
  buildMyAttendanceHistoryQueryOptions,
  buildMyAttendanceQueryOptions,
  buildMyParticipationQueryOptions,
} from './attendance-self.query';

vi.mock('../services/get-my-attendance.service', () => ({ getMyAttendance: vi.fn() }));
vi.mock('../services/get-my-attendance-history.service', () => ({
  getMyAttendanceHistory: vi.fn(),
}));
vi.mock('../services/get-my-participation.service', () => ({ getMyParticipation: vi.fn() }));

describe('buildMyAttendanceQueryOptions', () => {
  it('keys per team and session and defers to the self service', () => {
    const options = buildMyAttendanceQueryOptions('team-1', 'sess-1');

    expect(options.queryKey).toEqual(['attendance', 'team', 'team-1', 'self', 'sess-1']);
    expect(options.enabled).toBe(true);
    void options.queryFn();
    expect(getMyAttendance).toHaveBeenCalledWith('team-1', 'sess-1');
  });

  it('never fires without a resolved team and session', () => {
    expect(buildMyAttendanceQueryOptions('', 'sess-1').enabled).toBe(false);
    expect(buildMyAttendanceQueryOptions('team-1', '').enabled).toBe(false);
  });
});

describe('buildMyParticipationQueryOptions', () => {
  it('keys the all-time summary under the participation family', () => {
    const options = buildMyParticipationQueryOptions('team-1', null);

    expect(options.queryKey).toEqual(['attendance', 'team', 'team-1', 'participation', 'all']);
    void options.queryFn();
    expect(getMyParticipation).toHaveBeenCalledWith('team-1', null);
  });

  it('keys each season apart and never fires without a team', () => {
    expect(buildMyParticipationQueryOptions('team-1', 'season-1').queryKey).toEqual([
      'attendance',
      'team',
      'team-1',
      'participation',
      'season-1',
    ]);
    expect(buildMyParticipationQueryOptions('', null).enabled).toBe(false);
  });
});

describe('buildMyAttendanceHistoryQueryOptions', () => {
  it('keys the grown window size and defers to the history service', () => {
    const options = buildMyAttendanceHistoryQueryOptions('team-1', 40);

    expect(options.queryKey).toEqual(['attendance', 'team', 'team-1', 'self-history', 40]);
    expect(options.enabled).toBe(true);
    void options.queryFn();
    expect(getMyAttendanceHistory).toHaveBeenCalledWith('team-1', 40);
  });

  it('keeps the previous window visible while the next loads and gates on team', () => {
    const options = buildMyAttendanceHistoryQueryOptions('team-1', 20);
    const previous = mapAttendanceSelfHistory(makeSelfHistoryDto());

    expect(options.placeholderData(previous)).toBe(previous);
    expect(options.placeholderData(undefined)).toBeUndefined();
    expect(buildMyAttendanceHistoryQueryOptions('', 20).enabled).toBe(false);
  });
});
