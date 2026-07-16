import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildAuthUser } from '../factories/auth.factory';
import { getCurrentUser } from '../services/get-current-user.service';
import { authQueryKeys } from './auth.keys';
import { buildCurrentUserQueryOptions } from './current-user.query';

vi.mock('../services/get-current-user.service', () => ({ getCurrentUser: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('buildCurrentUserQueryOptions', () => {
  it('keys the query through the auth key factory', () => {
    expect(buildCurrentUserQueryOptions().queryKey).toEqual(authQueryKeys.currentUser());
  });

  it('delegates fetching to the current-user use case', async () => {
    const user = buildAuthUser();
    vi.mocked(getCurrentUser).mockResolvedValue(user);

    await expect(buildCurrentUserQueryOptions().queryFn()).resolves.toBe(user);
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('does not fetch until the query function is invoked', () => {
    buildCurrentUserQueryOptions();

    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it('propagates use-case failures to the caller', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('nope'));

    await expect(buildCurrentUserQueryOptions().queryFn()).rejects.toThrow('nope');
  });
});
