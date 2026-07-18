import { IonNote } from '@/packages/ionic';
import { AppButton, AppInput } from '@/shared/ui';

import { FORGOT_PASSWORD_FORM_TEST_IDS } from './forgot-password-form.constants';
import type { ForgotPasswordFormProps } from './forgot-password-form.types';

/** Presentational forgot-password form: a single email field and submit. */
export function ForgotPasswordForm(props: ForgotPasswordFormProps): React.JSX.Element {
  return (
    <form onSubmit={props.onSubmit} noValidate className="flex flex-col gap-4">
      <AppInput
        label={props.emailLabel}
        name={props.email.name}
        value={props.email.value}
        onValueChange={props.email.onChange}
        onBlur={props.email.onBlur}
        type="email"
        placeholder={props.emailPlaceholder}
        errorMessage={props.email.errorMessage}
        autocomplete="email"
        testId={FORGOT_PASSWORD_FORM_TEST_IDS.email}
      />
      {props.submitErrorMessage === undefined ? null : (
        <IonNote color="danger" role="alert" data-testid={FORGOT_PASSWORD_FORM_TEST_IDS.error}>
          {props.submitErrorMessage}
        </IonNote>
      )}
      <AppButton
        label={props.isSubmitting ? props.submittingLabel : props.submitLabel}
        type="submit"
        expand
        loading={props.isSubmitting}
        testId={FORGOT_PASSWORD_FORM_TEST_IDS.submit}
      />
    </form>
  );
}
