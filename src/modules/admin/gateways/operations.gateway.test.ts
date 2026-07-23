import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import {
  requestAuditEntries,
  requestDeadLetters,
  requestJobHealth,
  requestOutboxMetrics,
  requestReplayEvent,
} from './operations.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const get = vi.fn();
const post = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  get.mockResolvedValue({});
  post.mockResolvedValue({});
  vi.mocked(getAppHttpClient).mockReturnValue({ get, post } as never);
});

describe('operations.gateway', () => {
  it('reads the outbox metrics from the published admin endpoint', async () => {
    await requestOutboxMetrics();

    expect(get.mock.calls[0]?.[0]).toBe('/admin/outbox/metrics');
  });

  it('replays one event strictly by its encoded id, with an empty body', async () => {
    await requestReplayEvent('evt/1');

    const [path, body] = post.mock.calls[0] as [string, unknown];
    expect(path).toBe('/admin/outbox/evt%2F1/replay');
    expect(body).toEqual({});
  });

  it('reads the bounded dead-letter listing from its published path', async () => {
    await requestDeadLetters();

    const [path, , options] = get.mock.calls[0] as [string, unknown, { params: object }];
    expect(path).toBe('/admin/outbox/dead-letters');
    expect(options.params).toEqual({ limit: 25, offset: 0 });
  });

  it('reads job health from its published path', async () => {
    await requestJobHealth();

    expect(get.mock.calls[0]?.[0]).toBe('/admin/jobs/health');
  });

  it('reads the bounded audit page for one team', async () => {
    await requestAuditEntries('team/1');

    const [path, , options] = get.mock.calls[0] as [string, unknown, { params: object }];
    expect(path).toBe('/teams/team%2F1/audit');
    expect(options.params).toEqual({ limit: 25, offset: 0 });
  });
});
