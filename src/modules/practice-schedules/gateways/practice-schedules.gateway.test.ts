import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as HttpPackage from '@/packages/http';
import { getAppHttpClient } from '@/packages/http';

import type { ScheduleWriteBody } from '../mappers/practice-schedules.mapper';
import {
  requestSchedule,
  requestScheduleArchive,
  requestScheduleCreate,
  requestScheduleGenerate,
  requestScheduleList,
  requestScheduleUpdate,
} from './practice-schedules.gateway';

// Preserves the real `HTTP_ERROR_KIND` export: the schema import chain here
// pulls in the practice module's full public surface (for its session
// schema), which reaches `@/packages/query`'s client factory — a bare mock
// of this module would leave that factory without a value it needs at load
// time, unrelated to anything this file actually exercises.
vi.mock('@/packages/http', async (): Promise<typeof HttpPackage> => {
  const actual: typeof HttpPackage = await vi.importActual('@/packages/http');
  return { ...actual, getAppHttpClient: vi.fn() };
});

const client = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };

const SCHEDULE_DTO = {
  id: 's1',
  teamId: 't1',
  seasonId: null,
  name: 'Evening practice',
  sessionType: 'practice',
  timezone: 'Africa/Cairo',
  frequency: 'weekly',
  intervalWeeks: 1,
  weekdays: [1],
  startTimeLocal: '18:00',
  durationMinutes: 90,
  meetOffsetMinutes: null,
  rsvpCutoffMinutes: null,
  defaultVenueId: null,
  defaultField: null,
  defaultCapacity: null,
  visibility: 'team',
  organizerUserId: null,
  notes: null,
  generationStart: '2026-01-01',
  generationUntil: '2026-03-01',
  exceptions: [],
  status: 'active',
  createdBy: null,
  updatedBy: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  version: 1,
};

const WRITE_BODY: ScheduleWriteBody = {
  name: 'Evening practice',
  sessionType: 'practice',
  frequency: 'weekly',
  weekdays: [1],
  intervalWeeks: 1,
  startTimeLocal: '18:00',
  durationMinutes: 90,
  timezone: 'Africa/Cairo',
  generationStart: '2026-01-01',
  generationUntil: '2026-03-01',
  visibility: 'team',
};

beforeEach(() => {
  vi.clearAllMocks();
  client.get.mockResolvedValue(SCHEDULE_DTO);
  client.post.mockResolvedValue(SCHEDULE_DTO);
  client.patch.mockResolvedValue(SCHEDULE_DTO);
  client.delete.mockResolvedValue(undefined);
  vi.mocked(getAppHttpClient).mockReturnValue(client as never);
});

const PARAMS = { teamId: 't1', scheduleId: 's1' };

describe('practice-schedules gateway', () => {
  it('reads the team-scoped schedule list', async () => {
    client.get.mockResolvedValue({ items: [SCHEDULE_DTO], total: 1, limit: 20, offset: 0 });

    const page = await requestScheduleList({ teamId: 't1' });

    expect(client.get.mock.calls[0]?.[0]).toBe('/teams/t1/practice-schedules');
    expect(page.items).toHaveLength(1);
  });

  it('reads one schedule by id', async () => {
    const schedule = await requestSchedule(PARAMS);

    expect(client.get.mock.calls[0]?.[0]).toBe('/teams/t1/practice-schedules/s1');
    expect(schedule.id).toBe('s1');
  });

  it('creates a schedule against the collection route', async () => {
    const schedule = await requestScheduleCreate({ teamId: 't1' }, WRITE_BODY);

    expect(client.post.mock.calls[0]?.[0]).toBe('/teams/t1/practice-schedules');
    expect(client.post.mock.calls[0]?.[1]).toBe(WRITE_BODY);
    expect(schedule.id).toBe('s1');
  });

  it('updates a schedule with a PATCH carrying the whole replace body', async () => {
    const schedule = await requestScheduleUpdate(PARAMS, { ...WRITE_BODY, expectedVersion: 1 });

    expect(client.patch.mock.calls[0]?.[0]).toBe('/teams/t1/practice-schedules/s1');
    expect(client.patch.mock.calls[0]?.[1]).toEqual({ ...WRITE_BODY, expectedVersion: 1 });
    expect(schedule.version).toBe(1);
  });

  it('archives a schedule and discards whatever body the server sends back', async () => {
    await expect(requestScheduleArchive(PARAMS)).resolves.toBeUndefined();

    expect(client.delete.mock.calls[0]?.[0]).toBe('/teams/t1/practice-schedules/s1');
  });

  it('posts a generate with an empty body and reports the two counts', async () => {
    client.post.mockResolvedValue({ created: 2, skipped: 1, sessions: [] });

    await expect(requestScheduleGenerate(PARAMS)).resolves.toEqual({ created: 2, skipped: 1 });
    expect(client.post.mock.calls[0]?.[0]).toBe('/teams/t1/practice-schedules/s1/generate');
    expect(client.post.mock.calls[0]?.[1]).toEqual({});
  });

  it('encodes ids so a stray slash cannot escape the path', async () => {
    await requestSchedule({ teamId: 't/1', scheduleId: 's 1' });

    expect(client.get.mock.calls[0]?.[0]).toBe('/teams/t%2F1/practice-schedules/s%201');
  });
});
