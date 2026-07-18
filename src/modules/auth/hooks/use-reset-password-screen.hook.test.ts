import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { submitSetPasswordForm } from '../../../../tests/setup/set-password-form.driver';
import {
  useResetPasswordMutation,
  type ResetPasswordMutationView,
} from '../mutations/use-reset-password-mutation.hook';
import { useResetPasswordScreen } from './use-reset-password-screen.hook';

vi.mock('../mutations/use-reset-password-mutation.hook', () => ({
  useResetPasswordMutation: vi.fn(),
}));

const STRONG = 'Ranger#Strong1234';

function mockMutation(
  overrides: Partial<ResetPasswordMutationView> = {},
): ResetPasswordMutationView {
  const view: ResetPasswordMutationView = {
    submitReset: vi.fn(),
    isSubmitting: false,
    isSuccess: false,
    error: null,
    ...overrides,
  };
  vi.mocked(useResetPasswordMutation).mockReturnValue(view);
  return view;
}

function renderScreen(initialPath: string) {
  return renderHookWithProviders(() => useResetPasswordScreen(), { initialPath });
}

beforeAll(async () => {
  await initTestI18n();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useResetPasswordScreen', () => {
  it('reads the token from the URL and offers the strong-password labels', () => {
    mockMutation();

    const { result } = renderScreen('/reset-password?token=abc123');

    expect(result.current.isLinkMissing).toBe(false);
    expect(result.current.labels.title).toBe('Choose a new password');
    expect(result.current.labels.fields.submit).toBe('Update password');
  });

  it('flags a missing token as a dead link', () => {
    mockMutation();

    const { result } = renderScreen('/reset-password');

    expect(result.current.isLinkMissing).toBe(true);
  });

  it('mirrors success and translates a link-invalid failure', () => {
    mockMutation({ error: new AppError({ code: APP_ERROR_CODE.LinkInvalidOrExpired }) });

    const { result } = renderScreen('/reset-password?token=abc123');

    expect(result.current.submitErrorMessage).toBe(
      'This link is invalid or has expired. Request a new one.',
    );
  });

  it('submits the token and values when the password is valid', async () => {
    const view = mockMutation();

    const { result } = renderScreen('/reset-password?token=abc123');
    await submitSetPasswordForm(result.current.form, STRONG);

    expect(view.submitReset).toHaveBeenCalledExactlyOnceWith({
      token: 'abc123',
      values: { password: STRONG, confirmPassword: STRONG },
    });
  });
});
