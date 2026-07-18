import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { getInvitation } from '../services/get-invitation.service';
import { useInvitationQuery } from './use-invitation-query.hook';

vi.mock('../services/get-invitation.service', () => ({ getInvitation: vi.fn() }));

const DETAILS = {
  email: 'invitee@example.com',
  role: 'user' as const,
  inviterName: null,
  expiresAtIso: '2026-08-01T12:00:00.000Z',
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('useInvitationQuery', () => {
  it('stays idle and never fetches while the token is empty', () => {
    const { result } = renderHookWithProviders(() => useInvitationQuery(''));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.invitation).toBeUndefined();
    expect(result.current.error).toBeNull();
    expect(getInvitation).not.toHaveBeenCalled();
  });

  it('returns the invitation details once the lookup resolves', async () => {
    vi.mocked(getInvitation).mockResolvedValue(DETAILS);

    const { result } = renderHookWithProviders(() => useInvitationQuery('token-1'));

    await waitFor(() => {
      expect(result.current.invitation).toEqual(DETAILS);
    });
    expect(getInvitation).toHaveBeenCalledExactlyOnceWith('token-1');
  });

  it('surfaces a lookup failure as an AppError', async () => {
    vi.mocked(getInvitation).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.LinkInvalidOrExpired }),
    );

    const { result } = renderHookWithProviders(() => useInvitationQuery('token-1'));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.error?.code).toBe(APP_ERROR_CODE.LinkInvalidOrExpired);
  });
});
