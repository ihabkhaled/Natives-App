import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { FormFieldBinding } from '@/packages/forms';
import { TEST_IDS } from '@/shared/config';

import { fireIonInput } from '../../../../../tests/setup/ionic-events.helper';
import type { LoginScreenLabels } from '../../hooks/use-login-screen.hook';
import { LoginForm } from './login-form.component';
import { LOGIN_FORM_TEST_IDS } from './login-form.constants';
import type { LoginFormProps } from './login-form.types';

const LABELS: LoginScreenLabels = {
  title: 'Sign in',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Your password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  submit: 'Sign in',
  submitting: 'Signing in…',
  forgotPassword: 'Forgot your password?',
};

function buildBinding(name: string, overrides: Partial<FormFieldBinding> = {}): FormFieldBinding {
  return {
    name,
    value: '',
    onChange: vi.fn(),
    onBlur: vi.fn(),
    errorMessage: undefined,
    ...overrides,
  };
}

function buildProps(overrides: Partial<LoginFormProps> = {}): LoginFormProps {
  return {
    labels: LABELS,
    email: buildBinding('email'),
    password: buildBinding('password'),
    passwordRevealed: false,
    onTogglePasswordReveal: vi.fn(),
    onSubmit: vi.fn(),
    isSubmitting: false,
    submitErrorMessage: undefined,
    ...overrides,
  };
}

describe('LoginForm', () => {
  it('renders both credential fields under the shared test ids', () => {
    render(<LoginForm {...buildProps()} />);

    expect(screen.getByTestId(TEST_IDS.loginEmailInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.loginPasswordInput)).toBeInTheDocument();
    expect(LOGIN_FORM_TEST_IDS.email).toBe(TEST_IDS.loginEmailInput);
    expect(LOGIN_FORM_TEST_IDS.password).toBe(TEST_IDS.loginPasswordInput);
  });

  it('reports typed email input to the field binding', () => {
    const email = buildBinding('email');
    render(<LoginForm {...buildProps({ email })} />);

    fireIonInput(screen.getByTestId(LOGIN_FORM_TEST_IDS.email), 'ranger@example.com');

    expect(email.onChange).toHaveBeenCalledExactlyOnceWith('ranger@example.com');
  });

  it('reports typed password input to the field binding', () => {
    const password = buildBinding('password');
    render(<LoginForm {...buildProps({ password })} />);

    fireIonInput(screen.getByTestId(LOGIN_FORM_TEST_IDS.password), 'Sup3rSecret!');

    expect(password.onChange).toHaveBeenCalledExactlyOnceWith('Sup3rSecret!');
  });

  it('offers to reveal a masked password and delegates the toggle', async () => {
    const onTogglePasswordReveal = vi.fn();
    render(<LoginForm {...buildProps({ onTogglePasswordReveal })} />);

    await userEvent.click(screen.getByLabelText(LABELS.showPassword));

    expect(onTogglePasswordReveal).toHaveBeenCalledTimes(1);
  });

  it('offers to hide an already revealed password', () => {
    render(<LoginForm {...buildProps({ passwordRevealed: true })} />);

    expect(screen.getByLabelText(LABELS.hidePassword)).toBeInTheDocument();
    expect(screen.queryByLabelText(LABELS.showPassword)).not.toBeInTheDocument();
  });

  it('submits the form', () => {
    const onSubmit = vi.fn();
    render(<LoginForm {...buildProps({ onSubmit })} />);

    fireEvent.submit(screen.getByTestId(LOGIN_FORM_TEST_IDS.submit));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('hides the error note while there is no submit failure', () => {
    render(<LoginForm {...buildProps()} />);

    expect(screen.queryByTestId(LOGIN_FORM_TEST_IDS.error)).not.toBeInTheDocument();
  });

  it('announces the submit failure through the error note', () => {
    render(
      <LoginForm {...buildProps({ submitErrorMessage: 'The email or password is incorrect.' })} />,
    );

    const note = screen.getByTestId(TEST_IDS.loginErrorMessage);
    expect(note).toHaveTextContent('The email or password is incorrect.');
    expect(note).toHaveAttribute('role', 'alert');
  });

  it('labels the submit button for the idle state', () => {
    render(<LoginForm {...buildProps()} />);

    const submit = screen.getByTestId(TEST_IDS.loginSubmitButton);
    expect(submit).toHaveTextContent(LABELS.submit);
    expect(submit).not.toHaveAttribute('aria-busy', 'true');
  });

  it('labels and busies the submit button while submitting', () => {
    render(<LoginForm {...buildProps({ isSubmitting: true })} />);

    const submit = screen.getByTestId(TEST_IDS.loginSubmitButton);
    expect(submit).toHaveTextContent(LABELS.submitting);
    expect(submit).toHaveAttribute('aria-busy', 'true');
    expect(submit).toHaveProperty('disabled', true);
  });
});
