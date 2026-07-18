import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { requestPasswordResetLink } from '../services/request-password-reset.service';
import { useRequestPasswordResetMutation } from './use-request-password-reset-mutation.hook';

vi.mock('../services/request-password-reset.service', () => ({
  requestPasswordResetLink: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('useRequestPasswordResetMutation', () => {
  it('starts idle, not submitted, with no error', () => {
    const { result } = renderHookWithProviders(() => useRequestPasswordResetMutation());

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sends the email and flips isSubmitted on success', async () => {
    vi.mocked(requestPasswordResetLink).mockResolvedValue();

    const { result } = renderHookWithProviders(() => useRequestPasswordResetMutation());
    act(() => {
      result.current.requestReset('user@example.com');
    });

    await waitFor(() => {
      expect(result.current.isSubmitted).toBe(true);
    });
    expect(requestPasswordResetLink).toHaveBeenCalledExactlyOnceWith('user@example.com');
  });

  it('surfaces a transport failure as an AppError without marking submitted', async () => {
    vi.mocked(requestPasswordResetLink).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Server }),
    );

    const { result } = renderHookWithProviders(() => useRequestPasswordResetMutation());
    act(() => {
      result.current.requestReset('user@example.com');
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.error?.code).toBe(APP_ERROR_CODE.Server);
    expect(result.current.isSubmitted).toBe(false);
  });
});
