import { act, waitFor, type RenderHookResult } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { buildAuthUser } from '../factories/auth.factory';
import type { AuthSession } from '../mappers/auth.mapper';
import { loginUser } from '../services/login.service';
import { useSessionStore } from '../store/session.store';
import { SESSION_STATUS } from '../types/auth.types';
import { useLoginMutation, type LoginMutationView } from './use-login-mutation.hook';

vi.mock('../services/login.service', () => ({ loginUser: vi.fn() }));

const CREDENTIALS = { email: 'ranger@example.com', password: 'Sup3rSecret!' };
const SESSION: AuthSession = {
  user: buildAuthUser(),
  tokens: { accessToken: 'access-1', refreshToken: 'refresh-1' },
};

/** Drive a login whose use case rejects, and settle once a failure surfaces. */
async function loginRejectingWith(
  rejection: Error,
): Promise<RenderHookResult<LoginMutationView, unknown>['result']> {
  vi.mocked(loginUser).mockRejectedValue(rejection);

  const { result } = renderHookWithProviders(() => useLoginMutation());
  act(() => {
    result.current.login(CREDENTIALS);
  });

  await waitFor(() => {
    expect(result.current.error).not.toBeNull();
  });
  return result;
}

beforeEach(() => {
  useSessionStore.setState({ status: SESSION_STATUS.Unknown });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useLoginMutation', () => {
  it('starts idle with no error', () => {
    const { result } = renderHookWithProviders(() => useLoginMutation());

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('passes the credentials to the login use case', async () => {
    vi.mocked(loginUser).mockResolvedValue(SESSION);

    const { result } = renderHookWithProviders(() => useLoginMutation());
    act(() => {
      result.current.login(CREDENTIALS);
    });

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledExactlyOnceWith(CREDENTIALS);
    });
  });

  it('reports submitting while in flight and flips the session on success', async () => {
    let resolveLogin: (session: AuthSession) => void = () => undefined;
    vi.mocked(loginUser).mockReturnValue(
      new Promise<AuthSession>((resolve) => {
        resolveLogin = resolve;
      }),
    );

    const { result } = renderHookWithProviders(() => useLoginMutation());
    act(() => {
      result.current.login(CREDENTIALS);
    });

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(true);
    });
    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Unknown);

    resolveLogin(SESSION);

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
    });
    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Authenticated);
  });

  it('surfaces a failure as an AppError and leaves the session untouched', async () => {
    const result = await loginRejectingWith(
      new AppError({ code: APP_ERROR_CODE.InvalidCredentials }),
    );

    expect(result.current.error).toBeInstanceOf(AppError);
    expect(result.current.error?.code).toBe(APP_ERROR_CODE.InvalidCredentials);
    expect(result.current.isSubmitting).toBe(false);
    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Unknown);
  });

  it('normalizes a non-AppError failure into an AppError', async () => {
    const result = await loginRejectingWith(new Error('boom'));

    expect(result.current.error).toBeInstanceOf(AppError);
    expect(result.current.error?.code).toBe(APP_ERROR_CODE.Unexpected);
  });
});
