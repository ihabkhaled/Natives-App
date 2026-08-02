import { vi } from 'vitest';

import type { FormFieldBinding } from '@/packages/forms';
import type { SignupFormView } from '@/modules/auth/hooks/use-signup-form.hook';
import type { SignupScreenView } from '@/modules/auth/hooks/use-signup-screen.hook';
import type { SignupScreenCopy } from '@/modules/auth/types/signup.types';

/** A clean, spy-backed binding for one signup field. */
function buildSignupFieldBinding(
  name: string,
  overrides: Partial<FormFieldBinding> = {},
): FormFieldBinding {
  return {
    name,
    value: '',
    onChange: vi.fn(),
    onBlur: vi.fn(),
    errorMessage: undefined,
    ...overrides,
  };
}

/** Deterministic English copy for the signup screen, shared by every test. */
export const SIGNUP_TEST_COPY: SignupScreenCopy = {
  title: 'Request an account',
  logoLabel: 'Ultimate Natives logo',
  intro: 'Tell us who you are.',
  haveAccount: 'Already have an account? Sign in',
  backToLogin: 'Back to sign in',
  form: {
    displayNameLabel: 'Display name',
    displayNamePlaceholder: 'How your team will see you',
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'At least 12 characters',
    passwordHint: 'Use at least 12 characters.',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    capsLockWarning: 'Caps Lock is on.',
    summaryTitle: 'Please fix the following:',
    submit: 'Request account',
    submitting: 'Sending request…',
    statusSubmitting: 'Sending your request…',
  },
  pending: {
    title: 'Request received — awaiting approval',
    message: 'Your account stays switched off until an administrator approves it.',
    stepsTitle: 'What happens next',
    steps: ['An administrator reviews it.', 'We email you.', 'Then you can sign in.'],
  },
};

/** A clean signup form view model; every handler is a spy. */
export function buildSignupFormView(overrides: Partial<SignupFormView> = {}): SignupFormView {
  return {
    displayName: buildSignupFieldBinding('displayName'),
    email: buildSignupFieldBinding('email'),
    password: buildSignupFieldBinding('password'),
    passwordRevealed: false,
    onTogglePasswordReveal: vi.fn(),
    capsLockOn: false,
    onPasswordKeyUp: vi.fn(),
    summaryMessages: [],
    onSubmit: vi.fn(),
    ...overrides,
  };
}

/** The whole prepared signup screen, on the request-form branch by default. */
export function buildSignupScreenView(overrides: Partial<SignupScreenView> = {}): SignupScreenView {
  return {
    copy: SIGNUP_TEST_COPY,
    form: buildSignupFormView(),
    isSubmitting: false,
    isAwaitingApproval: false,
    submitErrorMessage: undefined,
    onBackToLogin: vi.fn(),
    ...overrides,
  };
}
