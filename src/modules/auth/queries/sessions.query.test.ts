import { afterEach, describe, expect, it, vi } from 'vitest';

import { listSessions } from '../services/list-sessions.service';
import { authQueryKeys } from './auth.keys';
import { buildSessionsQueryOptions } from './sessions.query';

vi.mock('../services/list-sessions.service', () => ({ listSessions: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('buildSessionsQueryOptions', () => {
  it('keys the query through the sessions key factory', () => {
    expect(buildSessionsQueryOptions().queryKey).toEqual(authQueryKeys.sessions());
  });

  it('delegates fetching to the list-sessions use case', async () => {
    vi.mocked(listSessions).mockResolvedValue([]);

    await expect(buildSessionsQueryOptions().queryFn()).resolves.toEqual([]);
    expect(listSessions).toHaveBeenCalledTimes(1);
  });

  it('does not fetch until the query function is invoked', () => {
    buildSessionsQueryOptions();

    expect(listSessions).not.toHaveBeenCalled();
  });
});
