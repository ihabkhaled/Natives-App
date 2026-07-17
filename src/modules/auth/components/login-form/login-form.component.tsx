import { IonNote } from '@/packages/ionic';
import { AppButton, AppInput, AppPasswordInput } from '@/shared/ui';

import { LOGIN_FORM_TEST_IDS } from './login-form.constants';
import type { LoginFormProps } from './login-form.types';

export function LoginForm(props: LoginFormProps): React.JSX.Element {
  return (
    <form onSubmit={props.onSubmit} noValidate className="flex flex-col gap-4">
      <AppInput
        label={props.labels.emailLabel}
        name={props.email.name}
        value={props.email.value}
        onValueChange={props.email.onChange}
        onBlur={props.email.onBlur}
        type="email"
        placeholder={props.labels.emailPlaceholder}
        errorMessage={props.email.errorMessage}
        autocomplete="email"
        testId={LOGIN_FORM_TEST_IDS.email}
      />
      <AppPasswordInput
        label={props.labels.passwordLabel}
        name={props.password.name}
        value={props.password.value}
        onValueChange={props.password.onChange}
        onBlur={props.password.onBlur}
        placeholder={props.labels.passwordPlaceholder}
        errorMessage={props.password.errorMessage}
        revealed={props.passwordRevealed}
        onToggleReveal={props.onTogglePasswordReveal}
        revealLabel={props.labels.showPassword}
        hideLabel={props.labels.hidePassword}
        testId={LOGIN_FORM_TEST_IDS.password}
      />
      {props.submitErrorMessage === undefined ? null : (
        <IonNote color="danger" role="alert" data-testid={LOGIN_FORM_TEST_IDS.error}>
          {props.submitErrorMessage}
        </IonNote>
      )}
      <AppButton
        label={props.isSubmitting ? props.labels.submitting : props.labels.submit}
        type="submit"
        expand
        loading={props.isSubmitting}
        testId={LOGIN_FORM_TEST_IDS.submit}
      />
    </form>
  );
}
