import { IonNote } from '@/packages/ionic';
import { AppButton, AppInput, AppPasswordInput } from '@/shared/ui';

import { SET_PASSWORD_FIELDS_TEST_IDS } from './set-password-fields.constants';
import type { SetPasswordFieldsProps } from './set-password-fields.types';

/**
 * Shared strong-password form body (create + confirm). Purely presentational:
 * the owning hook holds validation, reveal, and Caps Lock state. Reused by
 * password reset and invitation acceptance; the latter adds a display-name
 * field so the invitee lands with a name of their own choosing.
 */
export function SetPasswordFields(props: SetPasswordFieldsProps): React.JSX.Element {
  const { form, labels } = props;
  return (
    <form onSubmit={form.onSubmit} noValidate className="flex flex-col gap-4">
      {form.summaryMessages.length === 0 ? null : (
        <div role="alert" data-testid={SET_PASSWORD_FIELDS_TEST_IDS.summary}>
          <IonNote color="danger">{labels.summaryTitle}</IonNote>
          <ul className="m-0 ps-5 text-sm">
            {form.summaryMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      {props.displayNameField === undefined ? null : (
        <AppInput
          testId={SET_PASSWORD_FIELDS_TEST_IDS.displayName}
          label={props.displayNameField.label}
          name="display-name"
          value={props.displayNameField.value}
          placeholder={props.displayNameField.placeholder}
          onValueChange={props.displayNameField.onChange}
        />
      )}
      <AppPasswordInput
        label={labels.passwordLabel}
        name={form.password.name}
        value={form.password.value}
        onValueChange={form.password.onChange}
        onBlur={form.password.onBlur}
        onKeyUp={form.onPasswordKeyUp}
        placeholder={labels.passwordPlaceholder}
        errorMessage={form.password.errorMessage}
        revealed={form.passwordRevealed}
        onToggleReveal={form.onTogglePasswordReveal}
        revealLabel={labels.showPassword}
        hideLabel={labels.hidePassword}
        autocomplete="new-password"
        testId={SET_PASSWORD_FIELDS_TEST_IDS.password}
      />
      {form.capsLockOn ? (
        <IonNote color="warning" role="status" data-testid={SET_PASSWORD_FIELDS_TEST_IDS.capsLock}>
          {labels.capsLockWarning}
        </IonNote>
      ) : null}
      <AppPasswordInput
        label={labels.confirmLabel}
        name={form.confirmPassword.name}
        value={form.confirmPassword.value}
        onValueChange={form.confirmPassword.onChange}
        onBlur={form.confirmPassword.onBlur}
        placeholder={labels.confirmPlaceholder}
        errorMessage={form.confirmPassword.errorMessage}
        revealed={form.confirmRevealed}
        onToggleReveal={form.onToggleConfirmReveal}
        revealLabel={labels.showPassword}
        hideLabel={labels.hidePassword}
        autocomplete="new-password"
        testId={SET_PASSWORD_FIELDS_TEST_IDS.confirm}
      />
      {props.submitErrorMessage === undefined ? null : (
        <IonNote color="danger" role="alert" data-testid={SET_PASSWORD_FIELDS_TEST_IDS.error}>
          {props.submitErrorMessage}
        </IonNote>
      )}
      <AppButton
        label={props.isSubmitting ? labels.submitting : labels.submit}
        type="submit"
        expand
        loading={props.isSubmitting}
        testId={SET_PASSWORD_FIELDS_TEST_IDS.submit}
      />
    </form>
  );
}
