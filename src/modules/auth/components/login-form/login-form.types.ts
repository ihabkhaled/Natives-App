import type { FormFieldBinding } from '@/packages/forms';

import type { LoginScreenLabels } from '../../hooks/use-login-screen.hook';

export interface LoginFormProps {
  readonly labels: LoginScreenLabels;
  readonly email: FormFieldBinding;
  readonly password: FormFieldBinding;
  readonly passwordRevealed: boolean;
  readonly onTogglePasswordReveal: () => void;
  readonly onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  readonly isSubmitting: boolean;
  readonly submitErrorMessage: string | undefined;
}
