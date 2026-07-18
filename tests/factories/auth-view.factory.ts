import { vi } from 'vitest';

import type { SetPasswordFieldsLabels } from '@/modules/auth/components/set-password-fields/set-password-fields.types';
import type { SetPasswordFormView } from '@/modules/auth/hooks/use-set-password-form.hook';
import type { FormFieldBinding } from '@/packages/forms';

function fieldBinding(name: string): FormFieldBinding {
  return { name, value: '', onChange: vi.fn(), onBlur: vi.fn(), errorMessage: undefined };
}

/** Deterministic SetPasswordFormView double for component and container tests. */
export function buildSetPasswordFormView(
  overrides: Partial<SetPasswordFormView> = {},
): SetPasswordFormView {
  return {
    password: fieldBinding('password'),
    confirmPassword: fieldBinding('confirmPassword'),
    passwordRevealed: false,
    confirmRevealed: false,
    onTogglePasswordReveal: vi.fn(),
    onToggleConfirmReveal: vi.fn(),
    capsLockOn: false,
    onPasswordKeyUp: vi.fn(),
    summaryMessages: [],
    onSubmit: vi.fn(),
    ...overrides,
  };
}

/** Translated set-password field labels for tests; override `submit` per flow. */
export function buildSetPasswordFieldsLabelsFixture(
  overrides: Partial<SetPasswordFieldsLabels> = {},
): SetPasswordFieldsLabels {
  return {
    passwordLabel: 'New password',
    passwordPlaceholder: 'At least 12 characters',
    confirmLabel: 'Confirm password',
    confirmPlaceholder: 'Re-enter your password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    capsLockWarning: 'Caps Lock is on.',
    summaryTitle: 'Please fix the following:',
    submit: 'Update password',
    submitting: 'Updating…',
    ...overrides,
  };
}
