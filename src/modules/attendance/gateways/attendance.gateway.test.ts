import { afterEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import type { AttendanceCorrection, AttendanceMark } from '../types/attendance.types';
import {
  requestAttendanceCorrection,
  requestAttendanceFinalization,
  requestAttendanceHistory,
  requestAttendanceRecord,
  requestAttendanceSheet,
  requestBulkAttendance,
} from './attendance.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const get = vi.fn().mockResolvedValue({});
const post = vi.fn().mockResolvedValue({});
const put = vi.fn().mockResolvedValue({});

vi.mocked(getAppHttpClient).mockReturnValue({ get, post, put } as never);

const FULL_MARK: AttendanceMark = {
  membershipId: 'm-1',
  status: 'present_late',
  latenessMinutes: 12,
  excuseCategory: 'travel',
  expectedVersion: 2,
};

const BARE_MARK: AttendanceMark = {
  membershipId: 'm-2',
  status: 'present_on_time',
  latenessMinutes: null,
  excuseCategory: null,
  expectedVersion: null,
};

afterEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAppHttpClient).mockReturnValue({ get, post, put } as never);
});

describe('requestAttendanceSheet', () => {
  it('reads the bounded, team-scoped roster page', async () => {
    await requestAttendanceSheet('team-1', 'sess-1', 100, 0);

    const [path, , options] = get.mock.calls[0] as [string, unknown, { params: object }];
    expect(path).toBe('/teams/team-1/practice-sessions/sess-1/attendance');
    expect(options.params).toEqual({ limit: 100, offset: 0 });
  });
});

describe('requestBulkAttendance', () => {
  it('maps each mark and omits nullable fields the contract does not receive', async () => {
    await requestBulkAttendance('team-1', 'sess-1', [FULL_MARK, BARE_MARK]);

    const [path, body] = post.mock.calls[0] as [string, { marks: unknown[] }];
    expect(path).toBe('/teams/team-1/practice-sessions/sess-1/attendance/bulk');
    expect(body.marks[0]).toEqual({
      membershipId: 'm-1',
      status: 'present_late',
      latenessMinutes: 12,
      excuseCategory: 'travel',
      expectedVersion: 2,
    });
    expect(body.marks[1]).toEqual({ membershipId: 'm-2', status: 'present_on_time' });
  });
});

describe('requestAttendanceRecord', () => {
  it('puts a single member mark on the member-scoped route', async () => {
    await requestAttendanceRecord('team-1', 'sess-1', BARE_MARK);

    const [path, body] = put.mock.calls[0] as [string, unknown];
    expect(path).toBe('/teams/team-1/practice-sessions/sess-1/attendance/m-2');
    expect(body).toEqual({ status: 'present_on_time' });
  });
});

describe('requestAttendanceFinalization', () => {
  it('posts the expected version to the finalize route', async () => {
    await requestAttendanceFinalization('team-1', 'sess-1', 3);

    const [path, body] = post.mock.calls[0] as [string, unknown];
    expect(path).toBe('/teams/team-1/practice-sessions/sess-1/attendance/finalize');
    expect(body).toEqual({ expectedVersion: 3 });
  });
});

describe('requestAttendanceCorrection', () => {
  it('puts the correction with a reason on the correction route', async () => {
    const correction: AttendanceCorrection = { ...FULL_MARK, reason: 'scanner outage' };
    await requestAttendanceCorrection('team-1', 'sess-1', correction);

    const [path, body] = put.mock.calls[0] as [string, { reason: string }];
    expect(path).toBe('/teams/team-1/practice-sessions/sess-1/attendance/m-1/correction');
    expect(body.reason).toBe('scanner outage');
  });
});

describe('requestAttendanceHistory', () => {
  it('reads the member-scoped revision history', async () => {
    await requestAttendanceHistory('team-1', 'sess-1', 'm-1');

    expect(get.mock.calls[0]?.[0]).toBe(
      '/teams/team-1/practice-sessions/sess-1/attendance/m-1/history',
    );
  });
});
