import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { buildAuthUser } from '../factories/auth.factory';
import { getCurrentUser } from '../services/get-current-user.service';
import { useCurrentUserQuery } from './use-current-user-query.hook';

vi.mock('../services/get-current-user.service', () => ({ getCurrentUser: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('useCurrentUserQuery', () => {
  it('starts pending with no user', () => {
    vi.mocked(getCurrentUser).mockResolvedValue(buildAuthUser());

    const { result } = renderHookWithProviders(() => useCurrentUserQuery());

    expect(result.current).toEqual({ user: undefined, isLoading: true, isError: false });
  });

  it('exposes the profile once it resolves', async () => {
    const user = buildAuthUser();
    vi.mocked(getCurrentUser).mockResolvedValue(user);

    const { result } = renderHookWithProviders(() => useCurrentUserQuery());

    await waitFor(() => {
      expect(result.current.user).toEqual(user);
    });
    expect(result.current).toEqual({ user, isLoading: false, isError: false });
  });

  it('does not fetch while disabled and stays pending', () => {
    vi.mocked(getCurrentUser).mockResolvedValue(buildAuthUser());

    const { result } = renderHookWithProviders(() => useCurrentUserQuery({ enabled: false }));

    expect(result.current).toEqual({ user: undefined, isLoading: true, isError: false });
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it('flags the error branch and keeps the user undefined', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Unauthorized }),
    );

    const { result } = renderHookWithProviders(() => useCurrentUserQuery());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current).toEqual({ user: undefined, isLoading: false, isError: true });
  });
});
