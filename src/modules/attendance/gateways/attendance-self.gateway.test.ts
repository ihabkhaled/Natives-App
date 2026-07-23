import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import {
  requestMyAttendance,
  requestMyAttendanceHistory,
  requestMyParticipation,
  requestSelfCheckIn,
} from './attendance-self.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const client = { get: vi.fn().mockResolvedValue({}), post: vi.fn().mockResolvedValue({}) };
const { get, post } = client;

afterEach(() => {
  vi.clearAllMocks();
});

beforeEach(() => {
  vi.mocked(getAppHttpClient).mockReturnValue(client as never);
});

describe('requestMyAttendance', () => {
  it('reads the token-scoped own record for the session', async () => {
    await requestMyAttendance('team-1', 'sess-1');

    expect(get.mock.calls[0]?.[0]).toBe('/teams/team-1/practice-sessions/sess-1/attendance/me');
  });
});

describe('requestSelfCheckIn', () => {
  it('posts an empty body when no note was written', async () => {
    await requestSelfCheckIn('team-1', 'sess-1', null);

    const [path, body] = post.mock.calls[0] as [string, object];
    expect(path).toBe('/teams/team-1/practice-sessions/sess-1/attendance/check-in');
    expect(body).toEqual({});
  });

  it('carries the optional note through the contract body', async () => {
    await requestSelfCheckIn('team-1', 'sess-1', 'stuck in traffic');

    expect(post.mock.calls[0]?.[1]).toEqual({ note: 'stuck in traffic' });
  });
});

describe('requestMyAttendanceHistory', () => {
  it('reads the bounded newest-first window from offset zero', async () => {
    await requestMyAttendanceHistory('team-1', 40);

    const [path, , options] = get.mock.calls[0] as [string, unknown, { params: object }];
    expect(path).toBe('/teams/team-1/attendance/me/history');
    expect(options.params).toEqual({ limit: '40', offset: '0' });
  });
});

describe('requestMyParticipation', () => {
  it('omits the season param for the all-time summary', async () => {
    await requestMyParticipation('team-1', null);

    const [path, , options] = get.mock.calls[0] as [string, unknown, { params: object }];
    expect(path).toBe('/teams/team-1/attendance/me/participation');
    expect(options.params).toEqual({});
  });

  it('narrows to one season when asked', async () => {
    await requestMyParticipation('team-1', 'season-1');

    const [, , options] = get.mock.calls[0] as [string, unknown, { params: object }];
    expect(options.params).toEqual({ seasonId: 'season-1' });
  });
});
