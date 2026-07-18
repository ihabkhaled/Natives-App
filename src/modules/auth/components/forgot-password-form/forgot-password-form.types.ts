import type { FormFieldBinding } from '@/packages/forms';

export interface ForgotPasswordFormProps {
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly email: FormFieldBinding;
  readonly onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  readonly isSubmitting: boolean;
  readonly submitErrorMessage: string | undefined;
}
