import type { SetPasswordFormView } from '../../hooks/use-set-password-form.hook';

export interface SetPasswordFieldsLabels {
  readonly passwordLabel: string;
  readonly passwordPlaceholder: string;
  readonly confirmLabel: string;
  readonly confirmPlaceholder: string;
  readonly showPassword: string;
  readonly hidePassword: string;
  readonly capsLockWarning: string;
  readonly summaryTitle: string;
  readonly submit: string;
  readonly submitting: string;
}

export interface SetPasswordFieldsProps {
  readonly labels: SetPasswordFieldsLabels;
  readonly form: SetPasswordFormView;
  readonly isSubmitting: boolean;
  readonly submitErrorMessage: string | undefined;
}
