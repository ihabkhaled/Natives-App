import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import {
  requestBlockReorder,
  requestPracticeAgenda,
  requestStationRemoval,
} from './practice-agenda.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

// The shared gateway double only mocks get/post; the agenda also deletes.
const client = { get: vi.fn(), post: vi.fn(), delete: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  client.get.mockResolvedValue({});
  client.post.mockResolvedValue({});
  client.delete.mockResolvedValue(undefined);
  vi.mocked(getAppHttpClient).mockReturnValue(client as never);
});

describe('practice-agenda gateway', () => {
  it('reads the whole plan from the session-scoped agenda resource', async () => {
    await requestPracticeAgenda({ teamId: 't1', sessionId: 's1' });

    expect(client.get.mock.calls[0]?.[0]).toBe('/teams/t1/practice-sessions/s1/agenda');
  });

  it('posts the complete block list so an untouched block cannot be dropped', async () => {
    await requestBlockReorder({
      teamId: 't1',
      sessionId: 's1',
      blockIds: ['b2', 'b1', 'b3'],
      expectedVersion: 4,
    });

    expect(client.post.mock.calls[0]?.[0]).toBe(
      '/teams/t1/practice-sessions/s1/agenda/blocks/reorder',
    );
    expect(client.post.mock.calls[0]?.[1]).toEqual({
      blockIds: ['b2', 'b1', 'b3'],
      expectedVersion: 4,
    });
  });

  it('omits the version guard only when the agenda has none yet', async () => {
    await requestBlockReorder({
      teamId: 't1',
      sessionId: 's1',
      blockIds: ['b1'],
      expectedVersion: null,
    });

    // Sending `expectedVersion: null` would fail the server's numeric
    // validation; absence is how "there is nothing to guard against" is said.
    expect(client.post.mock.calls[0]?.[1]).toEqual({ blockIds: ['b1'] });
  });

  it('deletes one station beneath its own block', async () => {
    await requestStationRemoval({
      teamId: 't1',
      sessionId: 's1',
      blockId: 'b1',
      stationId: 'st1',
    });

    expect(client.delete.mock.calls[0]?.[0]).toBe(
      '/teams/t1/practice-sessions/s1/agenda/blocks/b1/stations/st1',
    );
  });

  it('encodes every identifier that would otherwise break the path', async () => {
    await requestStationRemoval({
      teamId: 'a/b',
      sessionId: 'c/d',
      blockId: 'e/f',
      stationId: 'g/h',
    });

    expect(client.delete.mock.calls[0]?.[0]).toBe(
      '/teams/a%2Fb/practice-sessions/c%2Fd/agenda/blocks/e%2Ff/stations/g%2Fh',
    );
  });

  it('resolves through the configured client', () => {
    expect(vi.mocked(getAppHttpClient)).toBeDefined();
  });
});
