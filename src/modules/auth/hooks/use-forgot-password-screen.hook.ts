import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';

import { useRequestPasswordResetMutation } from '../mutations/use-request-password-reset-mutation.hook';
import { useBackToLogin } from './use-back-to-login.hook';
import {
  useForgotPasswordForm,
  type ForgotPasswordFormView,
} from './use-forgot-password-form.hook';

interface ForgotPasswordScreenLabels {
  readonly title: string;
  readonly intro: string;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly submit: string;
  readonly submitting: string;
  readonly backToLogin: string;
  readonly successTitle: string;
  readonly successMessage: string;
}

export interface ForgotPasswordScreenView {
  readonly labels: ForgotPasswordScreenLabels;
  readonly form: ForgotPasswordFormView;
  readonly isSubmitting: boolean;
  readonly isSubmitted: boolean;
  readonly submitErrorMessage: string | undefined;
  readonly onBackToLogin: () => void;
}

/** View model for the forgot-password screen. */
export function useForgotPasswordScreen(): ForgotPasswordScreenView {
  const { t } = useAppTranslation();
  const onBackToLogin = useBackToLogin();
  const mutation = useRequestPasswordResetMutation();
  const form = useForgotPasswordForm({
    translate: t,
    onValidSubmit: (values) => {
      mutation.requestReset(values.email);
    },
  });
  return {
    labels: {
      title: t(I18N_KEYS.auth.forgotPasswordTitle),
      intro: t(I18N_KEYS.auth.forgotPasswordIntro),
      emailLabel: t(I18N_KEYS.auth.emailLabel),
      emailPlaceholder: t(I18N_KEYS.auth.emailPlaceholder),
      submit: t(I18N_KEYS.auth.forgotPasswordSubmit),
      submitting: t(I18N_KEYS.auth.forgotPasswordSubmitting),
      backToLogin: t(I18N_KEYS.auth.backToLogin),
      successTitle: t(I18N_KEYS.auth.forgotPasswordSuccessTitle),
      successMessage: t(I18N_KEYS.auth.forgotPasswordSuccessMessage),
    },
    form,
    isSubmitting: mutation.isSubmitting,
    isSubmitted: mutation.isSubmitted,
    submitErrorMessage:
      mutation.error === null ? undefined : t(mapErrorCodeToI18nKey(mutation.error.code)),
    onBackToLogin,
  };
}
