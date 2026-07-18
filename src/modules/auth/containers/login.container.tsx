import { IonButton } from '@/packages/ionic';
import { useAppNavigation } from '@/packages/router';
import { TEST_IDS } from '@/shared/config';
import { PageShell } from '@/shared/ui';

import { LoginForm } from '../components/login-form';
import { useLoginScreen } from '../hooks/use-login-screen.hook';
import { forgotPasswordPath } from '../routes/auth.paths';

/** Login screen: view model in, presentational component out. */
export function LoginContainer(): React.JSX.Element {
  const screen = useLoginScreen();
  const navigation = useAppNavigation();
  return (
    <PageShell title={screen.labels.title} testId={TEST_IDS.loginPage}>
      <LoginForm
        labels={screen.labels}
        email={screen.form.email}
        password={screen.form.password}
        passwordRevealed={screen.form.passwordRevealed}
        onTogglePasswordReveal={screen.form.onTogglePasswordReveal}
        onSubmit={screen.form.onSubmit}
        isSubmitting={screen.isSubmitting}
        submitErrorMessage={screen.submitErrorMessage}
      />
      <IonButton
        fill="clear"
        expand="block"
        className="mt-2"
        onClick={() => {
          navigation.push(forgotPasswordPath());
        }}
        data-testid={TEST_IDS.loginForgotPasswordLink}
      >
        {screen.labels.forgotPassword}
      </IonButton>
    </PageShell>
  );
}
