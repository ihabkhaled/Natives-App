import { useState } from 'react';

import {
  translateFieldError,
  useAppForm,
  useAppFormField,
  type FormFieldBinding,
} from '@/packages/forms';

import { setPasswordFormSchema } from '../schemas/set-password-form.schema';
import type { SetPasswordFormValues } from '../types/auth.types';

export interface SetPasswordFormView {
  readonly password: FormFieldBinding;
  readonly confirmPassword: FormFieldBinding;
  readonly passwordRevealed: boolean;
  readonly confirmRevealed: boolean;
  readonly onTogglePasswordReveal: () => void;
  readonly onToggleConfirmReveal: () => void;
  readonly capsLockOn: boolean;
  readonly onPasswordKeyUp: (event: React.KeyboardEvent) => void;
  readonly summaryMessages: readonly string[];
  readonly onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
}

interface UseSetPasswordFormOptions {
  readonly translate: (message: string) => string;
  readonly onValidSubmit: (values: SetPasswordFormValues) => void;
}

function definedMessages(...messages: readonly (string | undefined)[]): readonly string[] {
  return messages.filter((message): message is string => message !== undefined);
}

/**
 * Schema-validated strong-password form shared by reset and invitation
 * acceptance: password + confirmation, per-field reveal toggles, a Caps Lock
 * signal, and an accessible summary of the current errors.
 */
export function useSetPasswordForm(options: UseSetPasswordFormOptions): SetPasswordFormView {
  const form = useAppForm<SetPasswordFormValues>({
    schema: setPasswordFormSchema,
    defaultValues: { password: '', confirmPassword: '' },
  });
  const passwordField = useAppFormField({ control: form.control, name: 'password' });
  const confirmField = useAppFormField({ control: form.control, name: 'confirmPassword' });
  const password = translateFieldError(passwordField, options.translate);
  const confirmPassword = translateFieldError(confirmField, options.translate);
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  const [confirmRevealed, setConfirmRevealed] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  return {
    password,
    confirmPassword,
    passwordRevealed,
    confirmRevealed,
    onTogglePasswordReveal: () => {
      setPasswordRevealed((revealed) => !revealed);
    },
    onToggleConfirmReveal: () => {
      setConfirmRevealed((revealed) => !revealed);
    },
    capsLockOn,
    onPasswordKeyUp: (event) => {
      setCapsLockOn(event.getModifierState('CapsLock'));
    },
    summaryMessages: definedMessages(password.errorMessage, confirmPassword.errorMessage),
    onSubmit: (event) => {
      void form.handleSubmit((values) => {
        options.onValidSubmit(values);
      })(event);
    },
  };
}
