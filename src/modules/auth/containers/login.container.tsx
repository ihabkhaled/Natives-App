import { TEST_IDS } from '@/shared/config';
import { PageShell } from '@/shared/ui';

import { LoginForm } from '../components/login-form';
import { useLoginScreen } from '../hooks/use-login-screen.hook';

/** Login screen: view model in, presentational component out. */
export function LoginContainer(): React.JSX.Element {
  const screen = useLoginScreen();
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
    </PageShell>
  );
}
