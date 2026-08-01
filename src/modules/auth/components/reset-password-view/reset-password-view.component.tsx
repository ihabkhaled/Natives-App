import { APP_ICONS } from '@/packages/icons';
import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusView } from '@/shared/ui';

import { AuthPanel } from '../auth-panel';
import { SetPasswordFields } from '../set-password-fields';
import type { ResetPasswordViewProps } from './reset-password-view.types';

/** Presentational reset-password screen: strong-password form or a status state. */
export function ResetPasswordView(props: ResetPasswordViewProps): React.JSX.Element {
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
      testId={TEST_IDS.resetPasswordPage}
      title={props.labels.title}
      logoLabel={props.labels.logoLabel}
      headingId="reset-password-heading"
    >
      {props.isLinkMissing || props.isSuccess ? (
        <StatusView
          icon={props.isSuccess ? APP_ICONS.checkmark : APP_ICONS.warning}
          tone={props.isSuccess ? 'neutral' : 'warning'}
          title={props.isSuccess ? props.labels.successTitle : props.labels.linkInvalidTitle}
          message={props.isSuccess ? props.labels.successMessage : props.labels.linkInvalidMessage}
          testId={TEST_IDS.resetPasswordStatus}
          action={backToLogin}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <IonText color="medium">
            <p className="m-0 text-center text-sm">{props.labels.intro}</p>
          </IonText>
          <SetPasswordFields
            labels={props.labels.fields}
            form={props.form}
            isSubmitting={props.isSubmitting}
            submitErrorMessage={props.submitErrorMessage}
          />
          {backToLogin}
        </div>
      )}
    </AuthPanel>
  );
}
