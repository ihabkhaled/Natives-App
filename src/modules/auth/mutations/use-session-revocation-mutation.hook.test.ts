import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import {
  createTestQueryClient,
  renderHookWithProviders,
} from '../../../../tests/setup/render-with-providers.helper';
import { authQueryKeys } from '../queries/auth.keys';
import { revokeOtherSessions } from '../services/revoke-other-sessions.service';
import { revokeSession } from '../services/revoke-session.service';
import { useSessionRevocationMutation } from './use-session-revocation-mutation.hook';

vi.mock('../services/revoke-session.service', () => ({ revokeSession: vi.fn() }));
vi.mock('../services/revoke-other-sessions.service', () => ({ revokeOtherSessions: vi.fn() }));

function renderRevocation(handlers: { onSuccess?: () => void; onError?: () => void } = {}) {
  const onSuccess = handlers.onSuccess ?? vi.fn();
  const onError = handlers.onError ?? vi.fn();
  const queryClient = createTestQueryClient();
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  const view = renderHookWithProviders(() => useSessionRevocationMutation({ onSuccess, onError }), {
    queryClient,
  });
  return { view, invalidateSpy, onSuccess, onError };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useSessionRevocationMutation', () => {
  it('revokes one session, refreshes the list, and confirms success', async () => {
    vi.mocked(revokeSession).mockResolvedValue();
    const { view, invalidateSpy, onSuccess } = renderRevocation();

    act(() => {
      view.result.current.revokeOne('session-2');
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: authQueryKeys.sessions() });
    expect(revokeSession).toHaveBeenCalledExactlyOnceWith('session-2');
  });

  it('revokes all other sessions and refreshes the list', async () => {
    vi.mocked(revokeOtherSessions).mockResolvedValue(2);
    const { view, invalidateSpy } = renderRevocation();

    act(() => {
      view.result.current.revokeOthers();
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: authQueryKeys.sessions() });
    });
    expect(revokeOtherSessions).toHaveBeenCalledTimes(1);
  });

  it('calls the error handler when a revoke fails', async () => {
    vi.mocked(revokeSession).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Server }));
    const onError = vi.fn();
    const { view } = renderRevocation({ onError });

    act(() => {
      view.result.current.revokeOne('session-2');
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
    });
  });
});
