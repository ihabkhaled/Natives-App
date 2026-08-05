import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import {
  requestReminderDispatch,
  requestReminderPreview,
  requestReminderStatus,
  requestReminderTest,
} from './practice-reminders.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const client = { get: vi.fn(), post: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  client.get.mockResolvedValue({});
  client.post.mockResolvedValue({ enqueued: true });
  vi.mocked(getAppHttpClient).mockReturnValue(client as never);
});

const PARAMS = { teamId: 't1', sessionId: 's1' };

describe('practice-reminders gateway', () => {
  it('reads status and preview from their own session-scoped routes', async () => {
    await requestReminderStatus(PARAMS);
    await requestReminderPreview(PARAMS);

    expect(client.get.mock.calls[0]?.[0]).toBe('/teams/t1/practice-sessions/s1/reminders/status');
    expect(client.get.mock.calls[1]?.[0]).toBe('/teams/t1/practice-sessions/s1/reminders/preview');
  });

  it('posts a dispatch with an empty body', async () => {
    client.post.mockResolvedValue({ candidates: 4, enqueued: 1 });

    await expect(requestReminderDispatch(PARAMS)).resolves.toEqual({
      candidates: 4,
      enqueued: 1,
    });
    expect(client.post.mock.calls[0]?.[0]).toBe(
      '/teams/t1/practice-sessions/s1/reminders/dispatch',
    );
    expect(client.post.mock.calls[0]?.[1]).toEqual({});
  });

  /**
   * There is no recipient parameter anywhere in the request: the server
   * resolves it from the token, which is what makes a self-test impossible to
   * aim at the roster.
   */
  it('posts a self-test carrying no recipient', async () => {
    await requestReminderTest(PARAMS);

    expect(client.post.mock.calls[0]?.[0]).toBe('/teams/t1/practice-sessions/s1/reminders/test');
    expect(client.post.mock.calls[0]?.[1]).toEqual({});
  });

  it('collapses an absent test reason to null', async () => {
    client.post.mockResolvedValue({ enqueued: true });

    await expect(requestReminderTest(PARAMS)).resolves.toEqual({
      enqueued: true,
      reason: null,
    });
  });

  it('keeps a quiet-hours refusal reason', async () => {
    client.post.mockResolvedValue({ enqueued: false, reason: 'quiet_hours' });

    await expect(requestReminderTest(PARAMS)).resolves.toEqual({
      enqueued: false,
      reason: 'quiet_hours',
    });
  });

  it('encodes ids so a stray slash cannot escape the path', async () => {
    await requestReminderStatus({ teamId: 't/1', sessionId: 's 1' });

    expect(client.get.mock.calls[0]?.[0]).toBe(
      '/teams/t%2F1/practice-sessions/s%201/reminders/status',
    );
  });
});
