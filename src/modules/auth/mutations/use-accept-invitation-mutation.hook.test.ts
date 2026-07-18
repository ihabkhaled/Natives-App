import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { buildAuthUser } from '../factories/auth.factory';
import type { AuthSession } from '../mappers/auth.mapper';
import { acceptInvitation } from '../services/accept-invitation.service';
import { useSessionStore } from '../store/session.store';
import { SESSION_STATUS } from '../types/auth.types';
import { useAcceptInvitationMutation } from './use-accept-invitation-mutation.hook';

vi.mock('../services/accept-invitation.service', () => ({ acceptInvitation: vi.fn() }));

const INPUT = { token: 'invite-1', password: 'Ranger#Strong1234' };
const SESSION: AuthSession = {
  user: buildAuthUser(),
  tokens: { accessToken: 'access-1', refreshToken: 'refresh-1' },
};

beforeEach(() => {
  useSessionStore.setState({ status: SESSION_STATUS.Unknown });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useAcceptInvitationMutation', () => {
  it('accepts the invitation and flips the session to authenticated', async () => {
    vi.mocked(acceptInvitation).mockResolvedValue(SESSION);

    const { result } = renderHookWithProviders(() => useAcceptInvitationMutation());
    act(() => {
      result.current.accept(INPUT);
    });

    await waitFor(() => {
      expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Authenticated);
    });
    expect(acceptInvitation).toHaveBeenCalledExactlyOnceWith(INPUT.token, INPUT.password);
  });

  it('surfaces a link-invalid failure and leaves the session anonymous', async () => {
    vi.mocked(acceptInvitation).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.LinkInvalidOrExpired }),
    );

    const { result } = renderHookWithProviders(() => useAcceptInvitationMutation());
    act(() => {
      result.current.accept(INPUT);
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.error?.code).toBe(APP_ERROR_CODE.LinkInvalidOrExpired);
    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Unknown);
  });
});
