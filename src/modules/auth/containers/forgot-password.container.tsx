import { APP_ICONS } from '@/packages/icons';
import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, PageShell, StatusView } from '@/shared/ui';

import { ForgotPasswordForm } from '../components/forgot-password-form';
import { useForgotPasswordScreen } from '../hooks/use-forgot-password-screen.hook';

/** Forgot-password screen: request form in, enumeration-safe confirmation out. */
export function ForgotPasswordContainer(): React.JSX.Element {
  const screen = useForgotPasswordScreen();
  const backToLogin = (
    <AppButton
      label={screen.labels.backToLogin}
      tone="secondary"
      onClick={screen.onBackToLogin}
      testId={TEST_IDS.authBackToLoginLink}
    />
  );
  if (screen.isSubmitted) {
    return (
      <PageShell title={screen.labels.title} testId={TEST_IDS.forgotPasswordPage}>
        <StatusView
          icon={APP_ICONS.checkmark}
          tone="neutral"
          title={screen.labels.successTitle}
          message={screen.labels.successMessage}
          testId={TEST_IDS.forgotPasswordSuccess}
          action={backToLogin}
        />
      </PageShell>
    );
  }
  return (
    <PageShell title={screen.labels.title} testId={TEST_IDS.forgotPasswordPage}>
      <div className="flex flex-col gap-4">
        <IonText color="medium">
          <p className="m-0 text-sm">{screen.labels.intro}</p>
        </IonText>
        <ForgotPasswordForm
          emailLabel={screen.labels.emailLabel}
          emailPlaceholder={screen.labels.emailPlaceholder}
          submitLabel={screen.labels.submit}
          submittingLabel={screen.labels.submitting}
          email={screen.form.email}
          onSubmit={screen.form.onSubmit}
          isSubmitting={screen.isSubmitting}
          submitErrorMessage={screen.submitErrorMessage}
        />
        {backToLogin}
      </div>
    </PageShell>
  );
}
