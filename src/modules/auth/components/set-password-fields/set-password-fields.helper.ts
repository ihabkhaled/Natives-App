import { I18N_KEYS } from '@/shared/i18n';

import type { SetPasswordFieldsLabels } from './set-password-fields.types';

/**
 * Build the translated labels the shared set-password form renders. The submit
 * copy differs per flow (reset vs invitation), so callers pass those two.
 */
export function buildSetPasswordFieldsLabels(
  translate: (key: string) => string,
  submit: string,
  submitting: string,
): SetPasswordFieldsLabels {
  return {
    passwordLabel: translate(I18N_KEYS.auth.newPasswordLabel),
    passwordPlaceholder: translate(I18N_KEYS.auth.newPasswordPlaceholder),
    confirmLabel: translate(I18N_KEYS.auth.confirmPasswordLabel),
    confirmPlaceholder: translate(I18N_KEYS.auth.confirmPasswordPlaceholder),
    showPassword: translate(I18N_KEYS.auth.showPassword),
    hidePassword: translate(I18N_KEYS.auth.hidePassword),
    capsLockWarning: translate(I18N_KEYS.auth.capsLockWarning),
    summaryTitle: translate(I18N_KEYS.auth.validationSummaryTitle),
    submit,
    submitting,
  };
}
