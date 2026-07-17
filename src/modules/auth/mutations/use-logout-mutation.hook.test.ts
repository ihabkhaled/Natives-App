import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createTestQueryClient,
  renderHookWithProviders,
} from '../../../../tests/setup/render-with-providers.helper';
import { buildAuthUser } from '../factories/auth.factory';
import { authQueryKeys } from '../queries/auth.keys';
import { logoutUser } from '../services/logout.service';
import { useSessionStore } from '../store/session.store';
import { SESSION_STATUS } from '../types/auth.types';
import { useLogoutMutation } from './use-logout-mutation.hook';

vi.mock('../services/logout.service', () => ({ logoutUser: vi.fn() }));

beforeEach(() => {
  useSessionStore.setState({ status: SESSION_STATUS.Authenticated });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useLogoutMutation', () => {
  it('starts idle', () => {
    const { result } = renderHookWithProviders(() => useLogoutMutation());

    expect(result.current.isLoggingOut).toBe(false);
  });

  it('calls the logout use case exactly once', async () => {
    vi.mocked(logoutUser).mockResolvedValue();

    const { result } = renderHookWithProviders(() => useLogoutMutation());
    act(() => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(logoutUser).toHaveBeenCalledTimes(1);
    });
  });

  // Logging out is local-first: the cache and session must clear whichever way
  // the server call lands, so both outcomes drive the identical expectations.
  it.each([
    ['the server acknowledges', (): void => void vi.mocked(logoutUser).mockResolvedValue()],
    [
      'the server call fails',
      (): void => void vi.mocked(logoutUser).mockRejectedValue(new Error('offline')),
    ],
  ])(
    'drops cached server state and marks the session anonymous when %s',
    async (_label, arrange) => {
      arrange();
      const queryClient = createTestQueryClient();
      queryClient.setQueryData(authQueryKeys.currentUser(), buildAuthUser());

      const { result } = renderHookWithProviders(() => useLogoutMutation(), { queryClient });
      act(() => {
        result.current.logout();
      });

      await waitFor(() => {
        expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Anonymous);
      });
      expect(queryClient.getQueryData(authQueryKeys.currentUser())).toBeUndefined();
    },
  );

  it('reports the in-flight state while logging out', async () => {
    let resolveLogout: () => void = () => undefined;
    vi.mocked(logoutUser).mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLogout = resolve;
      }),
    );

    const { result } = renderHookWithProviders(() => useLogoutMutation());
    act(() => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.isLoggingOut).toBe(true);
    });

    resolveLogout();

    await waitFor(() => {
      expect(result.current.isLoggingOut).toBe(false);
    });
  });
});
