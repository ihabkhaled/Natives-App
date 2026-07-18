import {
  translateFieldError,
  useAppForm,
  useAppFormField,
  type FormFieldBinding,
} from '@/packages/forms';

import { forgotPasswordFormSchema } from '../schemas/forgot-password-form.schema';
import type { ForgotPasswordFormValues } from '../types/auth.types';

export interface ForgotPasswordFormView {
  readonly email: FormFieldBinding;
  readonly onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
}

interface UseForgotPasswordFormOptions {
  readonly translate: (message: string) => string;
  readonly onValidSubmit: (values: ForgotPasswordFormValues) => void;
}

/** Schema-validated forgot-password form; a single translated email field. */
export function useForgotPasswordForm(
  options: UseForgotPasswordFormOptions,
): ForgotPasswordFormView {
  const form = useAppForm<ForgotPasswordFormValues>({
    schema: forgotPasswordFormSchema,
    defaultValues: { email: '' },
  });
  const email = useAppFormField({ control: form.control, name: 'email' });
  return {
    email: translateFieldError(email, options.translate),
    onSubmit: (event) => {
      void form.handleSubmit((values) => {
        options.onValidSubmit(values);
      })(event);
    },
  };
}
