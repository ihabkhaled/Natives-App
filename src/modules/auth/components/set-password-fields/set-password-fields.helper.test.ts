import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { buildSetPasswordFieldsLabels } from './set-password-fields.helper';

describe('buildSetPasswordFieldsLabels', () => {
  it('translates each field key and passes the submit copy through', () => {
    const labels = buildSetPasswordFieldsLabels(
      (key) => `t:${key}`,
      'Update password',
      'Updating…',
    );

    expect(labels).toEqual({
      passwordLabel: `t:${I18N_KEYS.auth.newPasswordLabel}`,
      passwordPlaceholder: `t:${I18N_KEYS.auth.newPasswordPlaceholder}`,
      confirmLabel: `t:${I18N_KEYS.auth.confirmPasswordLabel}`,
      confirmPlaceholder: `t:${I18N_KEYS.auth.confirmPasswordPlaceholder}`,
      showPassword: `t:${I18N_KEYS.auth.showPassword}`,
      hidePassword: `t:${I18N_KEYS.auth.hidePassword}`,
      capsLockWarning: `t:${I18N_KEYS.auth.capsLockWarning}`,
      summaryTitle: `t:${I18N_KEYS.auth.validationSummaryTitle}`,
      submit: 'Update password',
      submitting: 'Updating…',
    });
  });
});
