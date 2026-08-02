import { useState } from 'react';

import {
  translateFieldError,
  useAppForm,
  useAppFormField,
  type FormFieldBinding,
} from '@/packages/forms';

import { signupFormSchema } from '../schemas/signup-form.schema';
import type { SignupFormValues } from '../types/signup.types';

export interface SignupFormView {
  readonly displayName: FormFieldBinding;
  readonly email: FormFieldBinding;
  readonly password: FormFieldBinding;
  readonly passwordRevealed: boolean;
  readonly onTogglePasswordReveal: () => void;
  readonly capsLockOn: boolean;
  readonly onPasswordKeyUp: (event: React.KeyboardEvent) => void;
  /** Every current field error, in field order, for the accessible summary. */
  readonly summaryMessages: readonly string[];
  readonly onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
}

interface UseSignupFormOptions {
  readonly translate: (message: string) => string;
  readonly onValidSubmit: (values: SignupFormValues) => void;
}

function presentMessages(...messages: readonly (string | undefined)[]): readonly string[] {
  return messages.filter((message): message is string => message !== undefined);
}

/**
 * Schema-validated signup form: display name, email, and a strong password
 * with a reveal toggle, a Caps Lock signal, and a summary of the current
 * errors. Validation mirrors the backend DTO so the first failure the user
 * sees is a translated field message rather than a 400.
 */
export function useSignupForm(options: UseSignupFormOptions): SignupFormView {
  const form = useAppForm<SignupFormValues>({
    schema: signupFormSchema,
    defaultValues: { displayName: '', email: '', password: '' },
  });
  const nameField = useAppFormField({ control: form.control, name: 'displayName' });
  const emailField = useAppFormField({ control: form.control, name: 'email' });
  const secretField = useAppFormField({ control: form.control, name: 'password' });
  const displayName = translateFieldError(nameField, options.translate);
  const email = translateFieldError(emailField, options.translate);
  const password = translateFieldError(secretField, options.translate);
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  return {
    displayName,
    email,
    password,
    passwordRevealed,
    onTogglePasswordReveal: () => {
      setPasswordRevealed((revealed) => !revealed);
    },
    capsLockOn,
    onPasswordKeyUp: (event) => {
      setCapsLockOn(event.getModifierState('CapsLock'));
    },
    summaryMessages: presentMessages(
      displayName.errorMessage,
      email.errorMessage,
      password.errorMessage,
    ),
    onSubmit: (event) => {
      void form.handleSubmit((values) => {
        options.onValidSubmit(values);
      })(event);
    },
  };
}
