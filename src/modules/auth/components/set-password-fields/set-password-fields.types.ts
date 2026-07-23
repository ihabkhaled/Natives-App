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

/** Optional identity field rendered above the password pair (invitation flow). */
export interface DisplayNameFieldView {
  readonly label: string;
  readonly placeholder: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export interface SetPasswordFieldsProps {
  readonly labels: SetPasswordFieldsLabels;
  readonly form: SetPasswordFormView;
  readonly isSubmitting: boolean;
  readonly submitErrorMessage: string | undefined;
  /** Present only on invitation acceptance; the reset flow omits it. */
  readonly displayNameField?: DisplayNameFieldView | undefined;
}
