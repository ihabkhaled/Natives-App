import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import type {
  ArchiveDrillCommand,
  CreateDrillCommand,
  UpdateDrillCommand,
} from '../types/drills.types';
import {
  requestArchiveDrill,
  requestCreateDrill,
  requestDrill,
  requestDrills,
  requestUpdateDrill,
} from './drills.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const client = { get: vi.fn(), post: vi.fn(), patch: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  client.get.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
  client.post.mockResolvedValue({});
  client.patch.mockResolvedValue({});
  vi.mocked(getAppHttpClient).mockReturnValue(client as never);
});

describe('drills gateway', () => {
  it('reads a bounded page with the requested limit and offset', async () => {
    await requestDrills({ teamId: 't1', limit: 50, offset: 0 });

    expect(client.get.mock.calls[0]?.[0]).toBe('/teams/t1/drills');
    expect(client.get.mock.calls[0]?.[2]).toEqual({ params: { limit: 50, offset: 0 } });
  });

  it('reads one drill by id', async () => {
    await requestDrill('t1', 'd1');

    expect(client.get.mock.calls[0]?.[0]).toBe('/teams/t1/drills/d1');
  });

  it('encodes ids so a stray slash cannot escape the path', async () => {
    await requestDrill('t/1', 'd 1');

    expect(client.get.mock.calls[0]?.[0]).toBe('/teams/t%2F1/drills/d%201');
  });

  it('posts a create with the mapped wire body', async () => {
    const command: CreateDrillCommand = {
      teamId: 't1',
      seasonId: null,
      name: 'Give-and-go break',
      category: 'throwing',
      intensity: 'high',
      objective: null,
      instructions: null,
      equipment: [],
      skillTags: [],
      defaultDurationMinutes: null,
      safetyNotes: null,
      mediaUrl: null,
    };

    await requestCreateDrill(command);

    expect(client.post.mock.calls[0]?.[0]).toBe('/teams/t1/drills');
    expect(client.post.mock.calls[0]?.[1]).toMatchObject({
      name: 'Give-and-go break',
      category: 'throwing',
      intensity: 'high',
    });
  });

  it("patches an update against the drill's own path", async () => {
    const command: UpdateDrillCommand = {
      teamId: 't1',
      drillId: 'd1',
      expectedVersion: 2,
      name: 'Give-and-go break',
      category: 'throwing',
      intensity: 'high',
      objective: null,
      instructions: null,
      equipment: [],
      skillTags: [],
      defaultDurationMinutes: null,
      safetyNotes: null,
      mediaUrl: null,
    };

    await requestUpdateDrill(command);

    expect(client.patch.mock.calls[0]?.[0]).toBe('/teams/t1/drills/d1');
    expect(client.patch.mock.calls[0]?.[1]).toMatchObject({ expectedVersion: 2 });
  });

  it('archives with an empty body, since there is nothing to write but the id', async () => {
    const command: ArchiveDrillCommand = { teamId: 't1', drillId: 'd1' };

    await requestArchiveDrill(command);

    expect(client.post.mock.calls[0]?.[0]).toBe('/teams/t1/drills/d1/archive');
    expect(client.post.mock.calls[0]?.[1]).toEqual({});
  });
});
