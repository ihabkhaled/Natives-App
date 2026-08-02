import { useAppTranslation } from '@/packages/i18n';

import { buildSignupCopy } from '../helpers/signup-copy.helper';
import { mapSignupErrorToI18nKey } from '../helpers/signup-error.helper';
import { useSignupMutation } from '../mutations/use-signup-mutation.hook';
import type { SignupScreenCopy } from '../types/signup.types';
import { useBackToLogin } from './use-back-to-login.hook';
import { useSignupForm, type SignupFormView } from './use-signup-form.hook';

export interface SignupScreenView {
  readonly copy: SignupScreenCopy;
  readonly form: SignupFormView;
  readonly isSubmitting: boolean;
  /** True once the account request was accepted and is awaiting approval. */
  readonly isAwaitingApproval: boolean;
  readonly submitErrorMessage: string | undefined;
  readonly onBackToLogin: () => void;
}

/**
 * View model for the signup screen. Success never authenticates: it flips the
 * screen to the awaiting-approval confirmation, because the backend issues no
 * tokens until an administrator approves the account.
 */
export function useSignupScreen(): SignupScreenView {
  const { t } = useAppTranslation();
  const onBackToLogin = useBackToLogin();
  const mutation = useSignupMutation();
  const form = useSignupForm({
    translate: t,
    onValidSubmit: (values) => {
      mutation.requestAccount(values);
    },
  });
  return {
    copy: buildSignupCopy(t),
    form,
    isSubmitting: mutation.isSubmitting,
    isAwaitingApproval: mutation.isSubmitted,
    submitErrorMessage:
      mutation.error === null ? undefined : t(mapSignupErrorToI18nKey(mutation.error.code)),
    onBackToLogin,
  };
}
