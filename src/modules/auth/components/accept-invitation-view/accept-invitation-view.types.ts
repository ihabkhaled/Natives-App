import type { SetPasswordFormView } from '../../hooks/use-set-password-form.hook';
import type { SetPasswordFieldsLabels } from '../set-password-fields/set-password-fields.types';

export interface AcceptInvitationViewProps {
  readonly introMessage: string;
  readonly emailLabel: string;
  readonly invitationEmail: string;
  readonly fieldsLabels: SetPasswordFieldsLabels;
  readonly form: SetPasswordFormView;
  readonly isSubmitting: boolean;
  readonly submitErrorMessage: string | undefined;
}
