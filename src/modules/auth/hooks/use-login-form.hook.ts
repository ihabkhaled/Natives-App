import { useState } from 'react';

import {
  translateFieldError,
  useAppForm,
  useAppFormField,
  type FormFieldBinding,
} from '@/packages/forms';
import type { TranslateParams } from '@/packages/i18n';

import { loginFormSchema } from '../schemas/login-form.schema';
import type { LoginFormValues } from '../types/auth.types';

export interface LoginFormView {
  readonly email: FormFieldBinding;
  readonly password: FormFieldBinding;
  readonly passwordRevealed: boolean;
  readonly onTogglePasswordReveal: () => void;
  readonly onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
}

interface UseLoginFormOptions {
  readonly translate: (key: string, params?: TranslateParams) => string;
  readonly onValidSubmit: (values: LoginFormValues) => void;
}

/** Schema-validated login form; error messages arrive as translated copy. */
export function useLoginForm(options: UseLoginFormOptions): LoginFormView {
  const form = useAppForm<LoginFormValues>({
    schema: loginFormSchema,
    defaultValues: { email: '', password: '' },
  });
  const email = useAppFormField({ control: form.control, name: 'email' });
  const password = useAppFormField({ control: form.control, name: 'password' });
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  return {
    email: translateFieldError(email, options.translate),
    password: translateFieldError(password, options.translate),
    passwordRevealed,
    onTogglePasswordReveal: () => {
      setPasswordRevealed((revealed) => !revealed);
    },
    onSubmit: (event) => {
      void form.handleSubmit((values) => {
        options.onValidSubmit(values);
      })(event);
    },
  };
}
