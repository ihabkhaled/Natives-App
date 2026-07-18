import { useAppTranslation } from '@/packages/i18n';
import { useSearchParam } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';

import { buildSetPasswordFieldsLabels } from '../components/set-password-fields/set-password-fields.helper';
import type { SetPasswordFieldsLabels } from '../components/set-password-fields/set-password-fields.types';
import { useResetPasswordMutation } from '../mutations/use-reset-password-mutation.hook';
import { useBackToLogin } from './use-back-to-login.hook';
import { useSetPasswordForm, type SetPasswordFormView } from './use-set-password-form.hook';

interface ResetPasswordScreenLabels {
  readonly title: string;
  readonly intro: string;
  readonly backToLogin: string;
  readonly successTitle: string;
  readonly successMessage: string;
  readonly linkInvalidTitle: string;
  readonly linkInvalidMessage: string;
  readonly fields: SetPasswordFieldsLabels;
}

export interface ResetPasswordScreenView {
  readonly labels: ResetPasswordScreenLabels;
  readonly form: SetPasswordFormView;
  readonly isSubmitting: boolean;
  readonly isSuccess: boolean;
  readonly isLinkMissing: boolean;
  readonly submitErrorMessage: string | undefined;
  readonly onBackToLogin: () => void;
}

/** View model for the reset-password screen; the token comes from the URL. */
export function useResetPasswordScreen(): ResetPasswordScreenView {
  const { t } = useAppTranslation();
  const onBackToLogin = useBackToLogin();
  const token = useSearchParam('token') ?? '';
  const mutation = useResetPasswordMutation();
  const form = useSetPasswordForm({
    translate: t,
    onValidSubmit: (values) => {
      mutation.submitReset({ token, values });
    },
  });
  return {
    labels: {
      title: t(I18N_KEYS.auth.resetPasswordTitle),
      intro: t(I18N_KEYS.auth.resetPasswordIntro),
      backToLogin: t(I18N_KEYS.auth.backToLogin),
      successTitle: t(I18N_KEYS.auth.resetPasswordSuccessTitle),
      successMessage: t(I18N_KEYS.auth.resetPasswordSuccessMessage),
      linkInvalidTitle: t(I18N_KEYS.auth.linkInvalidTitle),
      linkInvalidMessage: t(I18N_KEYS.auth.linkInvalidMessage),
      fields: buildSetPasswordFieldsLabels(
        t,
        t(I18N_KEYS.auth.resetPasswordSubmit),
        t(I18N_KEYS.auth.resetPasswordSubmitting),
      ),
    },
    form,
    isSubmitting: mutation.isSubmitting,
    isSuccess: mutation.isSuccess,
    isLinkMissing: token === '',
    submitErrorMessage:
      mutation.error === null ? undefined : t(mapErrorCodeToI18nKey(mutation.error.code)),
    onBackToLogin,
  };
}
