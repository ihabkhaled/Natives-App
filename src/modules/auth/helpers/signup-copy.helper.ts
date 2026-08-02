import { I18N_KEYS } from '@/shared/i18n';

import type { SignupScreenCopy } from '../types/signup.types';

/**
 * Resolve every string the signup screen renders in one pass. Kept out of the
 * screen hook so the copy contract is unit-testable without React and the hook
 * stays about state rather than vocabulary.
 */
export function buildSignupCopy(translate: (key: string) => string): SignupScreenCopy {
  return {
    title: translate(I18N_KEYS.signup.title),
    logoLabel: translate(I18N_KEYS.brand.logoAlt),
    intro: translate(I18N_KEYS.signup.intro),
    haveAccount: translate(I18N_KEYS.signup.haveAccount),
    backToLogin: translate(I18N_KEYS.auth.backToLogin),
    form: {
      displayNameLabel: translate(I18N_KEYS.signup.displayNameLabel),
      displayNamePlaceholder: translate(I18N_KEYS.signup.displayNamePlaceholder),
      emailLabel: translate(I18N_KEYS.signup.emailLabel),
      emailPlaceholder: translate(I18N_KEYS.signup.emailPlaceholder),
      passwordLabel: translate(I18N_KEYS.signup.passwordLabel),
      passwordPlaceholder: translate(I18N_KEYS.signup.passwordPlaceholder),
      passwordHint: translate(I18N_KEYS.signup.passwordHint),
      showPassword: translate(I18N_KEYS.auth.showPassword),
      hidePassword: translate(I18N_KEYS.auth.hidePassword),
      capsLockWarning: translate(I18N_KEYS.auth.capsLockWarning),
      summaryTitle: translate(I18N_KEYS.signup.summaryTitle),
      submit: translate(I18N_KEYS.signup.submit),
      submitting: translate(I18N_KEYS.signup.submitting),
      statusSubmitting: translate(I18N_KEYS.signup.statusSubmitting),
    },
    pending: {
      title: translate(I18N_KEYS.signup.pendingTitle),
      message: translate(I18N_KEYS.signup.pendingMessage),
      stepsTitle: translate(I18N_KEYS.signup.pendingStepsTitle),
      steps: [
        translate(I18N_KEYS.signup.pendingStepReview),
        translate(I18N_KEYS.signup.pendingStepEmail),
        translate(I18N_KEYS.signup.pendingStepSignIn),
      ],
    },
  };
}
