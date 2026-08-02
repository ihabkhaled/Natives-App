import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { submitSignup } from '../services/signup.service';
import { ACCOUNT_STATE } from '../types/auth.types';
import type { SignupFormValues } from '../types/signup.types';
import { useSignupMutation } from './use-signup-mutation.hook';

vi.mock('../services/signup.service', () => ({ submitSignup: vi.fn() }));

const VALUES: SignupFormValues = {
  displayName: 'Nadia Newcomer',
  email: 'nadia@example.com',
  password: 'Ranger#Strong1234',
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('useSignupMutation', () => {
  it('starts idle with no account state and no error', () => {
    const { result } = renderHookWithProviders(() => useSignupMutation());

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.accountState).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('forwards the request and reports the pending state on success', async () => {
    vi.mocked(submitSignup).mockResolvedValue(ACCOUNT_STATE.Pending);

    const { result } = renderHookWithProviders(() => useSignupMutation());
    act(() => {
      result.current.requestAccount(VALUES);
    });

    await waitFor(() => {
      expect(result.current.isSubmitted).toBe(true);
    });
    expect(submitSignup).toHaveBeenCalledExactlyOnceWith(VALUES);
    expect(result.current.accountState).toBe(ACCOUNT_STATE.Pending);
  });

  it('surfaces a duplicate-email conflict without marking the request submitted', async () => {
    vi.mocked(submitSignup).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Conflict }));

    const { result } = renderHookWithProviders(() => useSignupMutation());
    act(() => {
      result.current.requestAccount(VALUES);
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.error?.code).toBe(APP_ERROR_CODE.Conflict);
    expect(result.current.isSubmitted).toBe(false);
  });
});
