import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildSetPasswordFieldsLabelsFixture,
  buildSetPasswordFormView,
} from '../../../../tests/factories/auth-view.factory';
import {
  useResetPasswordScreen,
  type ResetPasswordScreenView,
} from '../hooks/use-reset-password-screen.hook';
import { ResetPasswordContainer } from './reset-password.container';

vi.mock('../hooks/use-reset-password-screen.hook', () => ({ useResetPasswordScreen: vi.fn() }));

const onBackToLogin = vi.fn();

function mockScreen(overrides: Partial<ResetPasswordScreenView> = {}): ResetPasswordScreenView {
  const view: ResetPasswordScreenView = {
    labels: {
      title: 'Choose a new password',
      intro: 'Create a strong password.',
      backToLogin: 'Back to sign in',
      successTitle: 'Password updated',
      successMessage: 'You can now sign in.',
      linkInvalidTitle: 'Link no longer works',
      linkInvalidMessage: 'This link is invalid or has expired.',
      fields: buildSetPasswordFieldsLabelsFixture(),
    },
    form: buildSetPasswordFormView(),
    isSubmitting: false,
    isSuccess: false,
    isLinkMissing: false,
    submitErrorMessage: undefined,
    onBackToLogin,
    ...overrides,
  };
  vi.mocked(useResetPasswordScreen).mockReturnValue(view);
  return view;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('ResetPasswordContainer', () => {
  it('renders the strong-password form for a valid link', () => {
    mockScreen();

    render(<ResetPasswordContainer />);

    expect(screen.getByTestId(TEST_IDS.resetPasswordPage)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.setPasswordInput)).toBeInTheDocument();
  });

  it('shows the link-invalid state when the token is missing', () => {
    mockScreen({ isLinkMissing: true });

    render(<ResetPasswordContainer />);

    expect(screen.getByTestId(TEST_IDS.resetPasswordStatus)).toHaveTextContent(
      'Link no longer works',
    );
    expect(screen.queryByTestId(TEST_IDS.setPasswordInput)).not.toBeInTheDocument();
  });

  it('confirms success after the password is updated', () => {
    mockScreen({ isSuccess: true });

    render(<ResetPasswordContainer />);

    expect(screen.getByTestId(TEST_IDS.resetPasswordStatus)).toHaveTextContent('Password updated');
  });

  it('returns to sign-in from the back link', async () => {
    mockScreen();

    render(<ResetPasswordContainer />);
    await userEvent.click(screen.getByTestId(TEST_IDS.authBackToLoginLink));

    expect(onBackToLogin).toHaveBeenCalledTimes(1);
  });
});
