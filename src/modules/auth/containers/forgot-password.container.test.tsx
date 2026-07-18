import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  useForgotPasswordScreen,
  type ForgotPasswordScreenView,
} from '../hooks/use-forgot-password-screen.hook';
import { ForgotPasswordContainer } from './forgot-password.container';

vi.mock('../hooks/use-forgot-password-screen.hook', () => ({ useForgotPasswordScreen: vi.fn() }));

const onBackToLogin = vi.fn();

function mockScreen(overrides: Partial<ForgotPasswordScreenView> = {}): ForgotPasswordScreenView {
  const view: ForgotPasswordScreenView = {
    labels: {
      title: 'Reset your password',
      intro: 'Enter your email.',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      submit: 'Send reset link',
      submitting: 'Sending…',
      backToLogin: 'Back to sign in',
      successTitle: 'Check your email',
      successMessage: 'If an account exists, we sent a link.',
    },
    form: {
      email: {
        name: 'email',
        value: '',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        errorMessage: undefined,
      },
      onSubmit: vi.fn(),
    },
    isSubmitting: false,
    isSubmitted: false,
    submitErrorMessage: undefined,
    onBackToLogin,
    ...overrides,
  };
  vi.mocked(useForgotPasswordScreen).mockReturnValue(view);
  return view;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('ForgotPasswordContainer', () => {
  it('renders the request form before submission', () => {
    mockScreen();

    render(<ForgotPasswordContainer />);

    expect(screen.getByTestId(TEST_IDS.forgotPasswordPage)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.forgotPasswordEmailInput)).toBeInTheDocument();
  });

  it('shows the enumeration-safe confirmation after submission', () => {
    mockScreen({ isSubmitted: true });

    render(<ForgotPasswordContainer />);

    expect(screen.getByTestId(TEST_IDS.forgotPasswordSuccess)).toHaveTextContent(
      'If an account exists, we sent a link.',
    );
    expect(screen.queryByTestId(TEST_IDS.forgotPasswordEmailInput)).not.toBeInTheDocument();
  });

  it('returns to sign-in from the back link', async () => {
    mockScreen();

    render(<ForgotPasswordContainer />);
    await userEvent.click(screen.getByTestId(TEST_IDS.authBackToLoginLink));

    expect(onBackToLogin).toHaveBeenCalledTimes(1);
  });
});
