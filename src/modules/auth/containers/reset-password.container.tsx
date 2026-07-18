import { APP_ICONS } from '@/packages/icons';
import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, PageShell, StatusView } from '@/shared/ui';

import { SetPasswordFields } from '../components/set-password-fields';
import { useResetPasswordScreen } from '../hooks/use-reset-password-screen.hook';

/** Reset-password screen: strong-password form, or a link-invalid/success state. */
export function ResetPasswordContainer(): React.JSX.Element {
  const screen = useResetPasswordScreen();
  const backToLogin = (
    <AppButton
      label={screen.labels.backToLogin}
      tone="secondary"
      onClick={screen.onBackToLogin}
      testId={TEST_IDS.authBackToLoginLink}
    />
  );
  if (screen.isLinkMissing || screen.isSuccess) {
    return (
      <PageShell title={screen.labels.title} testId={TEST_IDS.resetPasswordPage}>
        <StatusView
          icon={screen.isSuccess ? APP_ICONS.checkmark : APP_ICONS.warning}
          tone={screen.isSuccess ? 'neutral' : 'warning'}
          title={screen.isSuccess ? screen.labels.successTitle : screen.labels.linkInvalidTitle}
          message={
            screen.isSuccess ? screen.labels.successMessage : screen.labels.linkInvalidMessage
          }
          testId={TEST_IDS.resetPasswordStatus}
          action={backToLogin}
        />
      </PageShell>
    );
  }
  return (
    <PageShell title={screen.labels.title} testId={TEST_IDS.resetPasswordPage}>
      <div className="flex flex-col gap-4">
        <IonText color="medium">
          <p className="m-0 text-sm">{screen.labels.intro}</p>
        </IonText>
        <SetPasswordFields
          labels={screen.labels.fields}
          form={screen.form}
          isSubmitting={screen.isSubmitting}
          submitErrorMessage={screen.submitErrorMessage}
        />
        {backToLogin}
      </div>
    </PageShell>
  );
}
