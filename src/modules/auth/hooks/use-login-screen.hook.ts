import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';

import { useLoginMutation } from '../mutations/use-login-mutation.hook';
import { forgotPasswordPath } from '../routes/auth.paths';
import { useLoginForm, type LoginFormView } from './use-login-form.hook';

export interface LoginScreenLabels {
  readonly title: string;
  readonly logoLabel: string;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly passwordLabel: string;
  readonly passwordPlaceholder: string;
  readonly showPassword: string;
  readonly hidePassword: string;
  readonly submit: string;
  readonly submitting: string;
  readonly forgotPassword: string;
}

export interface LoginScreenView {
  readonly labels: LoginScreenLabels;
  readonly form: LoginFormView;
  readonly isSubmitting: boolean;
  readonly submitErrorMessage: string | undefined;
  readonly onForgotPassword: () => void;
}

/** Everything the login container renders, prepared and translated. */
export function useLoginScreen(): LoginScreenView {
  const { t } = useAppTranslation();
  const navigation = useAppNavigation();
  const loginMutation = useLoginMutation();
  const form = useLoginForm({
    translate: t,
    onValidSubmit: (values) => {
      loginMutation.login(values);
    },
  });
  return {
    labels: {
      title: t(I18N_KEYS.auth.loginTitle),
      logoLabel: t(I18N_KEYS.brand.logoAlt),
      emailLabel: t(I18N_KEYS.auth.emailLabel),
      emailPlaceholder: t(I18N_KEYS.auth.emailPlaceholder),
      passwordLabel: t(I18N_KEYS.auth.passwordLabel),
      passwordPlaceholder: t(I18N_KEYS.auth.passwordPlaceholder),
      showPassword: t(I18N_KEYS.auth.showPassword),
      hidePassword: t(I18N_KEYS.auth.hidePassword),
      submit: t(I18N_KEYS.auth.submit),
      submitting: t(I18N_KEYS.auth.submitting),
      forgotPassword: t(I18N_KEYS.auth.forgotPasswordLink),
    },
    form,
    isSubmitting: loginMutation.isSubmitting,
    submitErrorMessage:
      loginMutation.error === null ? undefined : t(mapErrorCodeToI18nKey(loginMutation.error.code)),
    onForgotPassword: () => {
      navigation.push(forgotPasswordPath());
    },
  };
}
