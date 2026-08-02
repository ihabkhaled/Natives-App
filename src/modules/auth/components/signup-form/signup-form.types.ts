import type { SignupFormView } from '../../hooks/use-signup-form.hook';
import type { SignupFormCopy } from '../../types/signup.types';

export interface SignupFormProps {
  readonly copy: SignupFormCopy;
  readonly form: SignupFormView;
  readonly isSubmitting: boolean;
  readonly submitErrorMessage: string | undefined;
}
