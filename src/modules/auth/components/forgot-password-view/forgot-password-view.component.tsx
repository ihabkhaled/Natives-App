import { APP_ICONS } from '@/packages/icons';
import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusView } from '@/shared/ui';

import { AuthPanel } from '../auth-panel';
import { ForgotPasswordForm } from '../forgot-password-form';
import type { ForgotPasswordViewProps } from './forgot-password-view.types';

/** Presentational forgot-password screen: request form or a safe confirmation. */
export function ForgotPasswordView(props: ForgotPasswordViewProps): React.JSX.Element {
  const backToLogin = (
    <AppButton
      label={props.labels.backToLogin}
      tone="secondary"
      expand
      onClick={props.onBackToLogin}
      testId={TEST_IDS.authBackToLoginLink}
    />
  );
  return (
    <AuthPanel
      testId={TEST_IDS.forgotPasswordPage}
      title={props.labels.title}
      logoLabel={props.labels.logoLabel}
      headingId="forgot-password-heading"
    >
      {props.isSubmitted ? (
        <StatusView
          icon={APP_ICONS.checkmark}
          tone="neutral"
          title={props.labels.successTitle}
          message={props.labels.successMessage}
          testId={TEST_IDS.forgotPasswordSuccess}
          action={backToLogin}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <IonText color="medium">
            <p className="m-0 text-center text-sm">{props.labels.intro}</p>
          </IonText>
          <ForgotPasswordForm
            emailLabel={props.labels.emailLabel}
            emailPlaceholder={props.labels.emailPlaceholder}
            submitLabel={props.labels.submit}
            submittingLabel={props.labels.submitting}
            email={props.form.email}
            onSubmit={props.form.onSubmit}
            isSubmitting={props.isSubmitting}
            submitErrorMessage={props.submitErrorMessage}
          />
          {backToLogin}
        </div>
      )}
    </AuthPanel>
  );
}
