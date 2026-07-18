import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { resetPassword } from '../services/reset-password.service';
import { useResetPasswordMutation } from './use-reset-password-mutation.hook';

vi.mock('../services/reset-password.service', () => ({ resetPassword: vi.fn() }));

const INPUT = {
  token: 'reset-token',
  values: { password: 'Ranger#Strong1234', confirmPassword: 'Ranger#Strong1234' },
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('useResetPasswordMutation', () => {
  it('starts without success or error', () => {
    const { result } = renderHookWithProviders(() => useResetPasswordMutation());

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('forwards the token and values to the reset use case and flips isSuccess', async () => {
    vi.mocked(resetPassword).mockResolvedValue();

    const { result } = renderHookWithProviders(() => useResetPasswordMutation());
    act(() => {
      result.current.submitReset(INPUT);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(resetPassword).toHaveBeenCalledExactlyOnceWith(INPUT.token, INPUT.values);
  });

  it('exposes a link-invalid failure as an AppError', async () => {
    vi.mocked(resetPassword).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.LinkInvalidOrExpired }),
    );

    const { result } = renderHookWithProviders(() => useResetPasswordMutation());
    act(() => {
      result.current.submitReset(INPUT);
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.error?.code).toBe(APP_ERROR_CODE.LinkInvalidOrExpired);
    expect(result.current.isSuccess).toBe(false);
  });
});
