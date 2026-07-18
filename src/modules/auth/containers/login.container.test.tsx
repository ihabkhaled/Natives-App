import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { FormFieldBinding } from '@/packages/forms';
import { TEST_IDS } from '@/shared/config';

import { renderWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useLoginScreen, type LoginScreenView } from '../hooks/use-login-screen.hook';
import { LoginContainer } from './login.container';

vi.mock('../hooks/use-login-screen.hook', () => ({ useLoginScreen: vi.fn() }));

// A title distinct from the submit label ('Sign in' in both, in real copy) so the
// assertions prove the shell title comes from the view model rather than the button.
const LABELS = {
  title: 'Sign in to Ranger',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Your password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  submit: 'Sign in',
  submitting: 'Signing in…',
  forgotPassword: 'Forgot your password?',
} as const;

function buildBinding(name: string): FormFieldBinding {
  return { name, value: '', onChange: vi.fn(), onBlur: vi.fn(), errorMessage: undefined };
}

function mockLoginScreen(overrides: Partial<LoginScreenView> = {}): LoginScreenView {
  const view: LoginScreenView = {
    labels: LABELS,
    form: {
      email: buildBinding('email'),
      password: buildBinding('password'),
      passwordRevealed: false,
      onTogglePasswordReveal: vi.fn(),
      onSubmit: vi.fn(),
    },
    isSubmitting: false,
    submitErrorMessage: undefined,
    ...overrides,
  };
  vi.mocked(useLoginScreen).mockReturnValue(view);
  return view;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('LoginContainer', () => {
  it('renders the login page shell titled from the view model', () => {
    mockLoginScreen();

    renderWithProviders(<LoginContainer />);

    expect(screen.getByTestId(TEST_IDS.loginPage)).toBeInTheDocument();
    expect(screen.getByText(LABELS.title)).toBeInTheDocument();
  });

  it('hands the labels to the login form', () => {
    mockLoginScreen();

    renderWithProviders(<LoginContainer />);

    expect(screen.getByTestId(TEST_IDS.loginEmailInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.loginPasswordInput)).toBeInTheDocument();
    expect(screen.getByLabelText(LABELS.showPassword)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.loginSubmitButton)).toHaveTextContent(LABELS.submit);
  });

  it('wires the form submit handler from the view model', () => {
    const view = mockLoginScreen();

    renderWithProviders(<LoginContainer />);
    fireEvent.submit(screen.getByTestId(TEST_IDS.loginSubmitButton));

    expect(view.form.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders the submitting state of the view model', () => {
    mockLoginScreen({ isSubmitting: true });

    renderWithProviders(<LoginContainer />);

    expect(screen.getByTestId(TEST_IDS.loginSubmitButton)).toHaveTextContent(LABELS.submitting);
  });

  it('renders the submit error from the view model', () => {
    mockLoginScreen({ submitErrorMessage: 'The email or password is incorrect.' });

    renderWithProviders(<LoginContainer />);

    expect(screen.getByTestId(TEST_IDS.loginErrorMessage)).toHaveTextContent(
      'The email or password is incorrect.',
    );
  });

  it('offers a forgot-password link that navigates to the recovery flow', () => {
    mockLoginScreen();

    renderWithProviders(<LoginContainer />);

    const link = screen.getByTestId(TEST_IDS.loginForgotPasswordLink);
    expect(link).toHaveTextContent(LABELS.forgotPassword);
    fireEvent.click(link);
  });
});
