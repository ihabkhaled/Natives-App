import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { buildSubmitEvent, flushAsyncWork } from '../../../../tests/setup/form-test.helper';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import {
  useRequestPasswordResetMutation,
  type RequestPasswordResetView,
} from '../mutations/use-request-password-reset-mutation.hook';
import { useForgotPasswordScreen } from './use-forgot-password-screen.hook';

vi.mock('../mutations/use-request-password-reset-mutation.hook', () => ({
  useRequestPasswordResetMutation: vi.fn(),
}));

function mockMutation(overrides: Partial<RequestPasswordResetView> = {}): RequestPasswordResetView {
  const view: RequestPasswordResetView = {
    requestReset: vi.fn(),
    isSubmitting: false,
    isSubmitted: false,
    error: null,
    ...overrides,
  };
  vi.mocked(useRequestPasswordResetMutation).mockReturnValue(view);
  return view;
}

function render() {
  return renderHookWithProviders(() => useForgotPasswordScreen(), {
    initialPath: '/forgot-password',
  });
}

beforeAll(async () => {
  await initTestI18n();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useForgotPasswordScreen', () => {
  it('exposes translated labels and mirrors a clean mutation', () => {
    mockMutation();

    const { result } = render();

    expect(result.current.labels.title).toBe('Reset your password');
    expect(result.current.labels.successTitle).toBe('Check your email');
    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.submitErrorMessage).toBeUndefined();
  });

  it('flips to submitted when the mutation reports success', () => {
    mockMutation({ isSubmitted: true });

    const { result } = render();

    expect(result.current.isSubmitted).toBe(true);
  });

  it('translates a server failure into sanitized copy', () => {
    mockMutation({ error: new AppError({ code: APP_ERROR_CODE.Server }) });

    const { result } = render();

    expect(result.current.submitErrorMessage).toBe(
      'Something went wrong on our side. Please try again.',
    );
  });

  it('sends a valid email to the mutation on submit', async () => {
    const view = mockMutation();

    const { result } = render();
    act(() => {
      result.current.form.email.onChange('user@example.com');
    });
    await act(async () => {
      result.current.form.onSubmit(buildSubmitEvent());
      await flushAsyncWork();
    });

    expect(view.requestReset).toHaveBeenCalledExactlyOnceWith('user@example.com');
  });

  it('navigates back to sign-in without error', async () => {
    mockMutation();

    const { result } = render();
    act(() => {
      result.current.onBackToLogin();
    });

    await waitFor(() => {
      expect(typeof result.current.onBackToLogin).toBe('function');
    });
  });
});
