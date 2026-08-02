import { IonNote } from '@/packages/ionic';
import { AppButton, AppInput, AppPasswordInput } from '@/shared/ui';

import { SIGNUP_FORM_TEST_IDS } from './signup-form.constants';
import type { SignupFormProps } from './signup-form.types';

/**
 * Presentational signup form: display name, email, and a strong password.
 * Every value, error, and toggle arrives prepared by `useSignupForm`. The
 * polite live region announces submission progress for screen-reader users,
 * while the error summary is assertive because it interrupts a submit.
 */
export function SignupForm(props: SignupFormProps): React.JSX.Element {
  return (
    <form onSubmit={props.form.onSubmit} noValidate className="flex flex-col gap-4">
      {props.form.summaryMessages.length === 0 ? null : (
        <div
          role="alert"
          data-testid={SIGNUP_FORM_TEST_IDS.summary}
          className="flex flex-col gap-1"
        >
          <IonNote color="danger">{props.copy.summaryTitle}</IonNote>
          <ul className="m-0 ps-5 text-sm">
            {props.form.summaryMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      <AppInput
        testId={SIGNUP_FORM_TEST_IDS.displayName}
        label={props.copy.displayNameLabel}
        name={props.form.displayName.name}
        value={props.form.displayName.value}
        onValueChange={props.form.displayName.onChange}
        onBlur={props.form.displayName.onBlur}
        placeholder={props.copy.displayNamePlaceholder}
        errorMessage={props.form.displayName.errorMessage}
        autocomplete="name"
      />
      <AppInput
        testId={SIGNUP_FORM_TEST_IDS.email}
        label={props.copy.emailLabel}
        name={props.form.email.name}
        value={props.form.email.value}
        onValueChange={props.form.email.onChange}
        onBlur={props.form.email.onBlur}
        placeholder={props.copy.emailPlaceholder}
        errorMessage={props.form.email.errorMessage}
        type="email"
        autocomplete="email"
      />
      <AppPasswordInput
        testId={SIGNUP_FORM_TEST_IDS.password}
        label={props.copy.passwordLabel}
        name={props.form.password.name}
        value={props.form.password.value}
        onValueChange={props.form.password.onChange}
        onBlur={props.form.password.onBlur}
        onKeyUp={props.form.onPasswordKeyUp}
        placeholder={props.copy.passwordPlaceholder}
        errorMessage={props.form.password.errorMessage}
        revealed={props.form.passwordRevealed}
        onToggleReveal={props.form.onTogglePasswordReveal}
        revealLabel={props.copy.showPassword}
        hideLabel={props.copy.hidePassword}
        autocomplete="new-password"
      />
      <IonNote className="text-xs">{props.copy.passwordHint}</IonNote>
      {props.form.capsLockOn ? (
        <IonNote color="warning" role="status">
          {props.copy.capsLockWarning}
        </IonNote>
      ) : null}
      {props.submitErrorMessage === undefined ? null : (
        <IonNote color="danger" role="alert" data-testid={SIGNUP_FORM_TEST_IDS.error}>
          {props.submitErrorMessage}
        </IonNote>
      )}
      <AppButton
        testId={SIGNUP_FORM_TEST_IDS.submit}
        label={props.isSubmitting ? props.copy.submitting : props.copy.submit}
        type="submit"
        expand
        loading={props.isSubmitting}
      />
      <p
        role="status"
        aria-live="polite"
        className="sr-only"
        data-testid={SIGNUP_FORM_TEST_IDS.status}
      >
        {props.isSubmitting ? props.copy.statusSubmitting : ''}
      </p>
    </form>
  );
}
