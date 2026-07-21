import { waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError, APP_ERROR_CODE } from '@/shared/errors';

import { getEffectivePermissions } from '../services/get-effective-permissions.service';
import { useScopedPermissionsQuery } from './use-scoped-permissions-query.hook';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

vi.mock('../services/get-effective-permissions.service', () => ({
  getEffectivePermissions: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(getEffectivePermissions).mockResolvedValue(['member.list']);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useScopedPermissionsQuery', () => {
  it('resolves the grants held inside the given team', async () => {
    const { result } = renderHookWithProviders(() => useScopedPermissionsQuery('team-1', true));

    await waitFor(() => {
      expect(result.current.permissions).toEqual(['member.list']);
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('stays quiet and unloaded while the scope is unresolved', () => {
    const { result } = renderHookWithProviders(() => useScopedPermissionsQuery('', true));

    expect(result.current).toEqual({ permissions: [], isLoading: false, isError: false });
    expect(getEffectivePermissions).not.toHaveBeenCalled();
  });

  it('stays quiet while the session is anonymous', () => {
    const { result } = renderHookWithProviders(() => useScopedPermissionsQuery('team-1', false));

    expect(result.current.isLoading).toBe(false);
    expect(getEffectivePermissions).not.toHaveBeenCalled();
  });

  it('reports a failure without pretending the principal has no grants forever', async () => {
    vi.mocked(getEffectivePermissions).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Server }),
    );

    const { result } = renderHookWithProviders(() => useScopedPermissionsQuery('team-1', true));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.permissions).toEqual([]);
  });
});
