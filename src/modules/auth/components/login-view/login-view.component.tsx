import { TEST_IDS } from '@/shared/config';
import { AppButton, BrandLogo, PageShell } from '@/shared/ui';

import { LoginForm } from '../login-form';
import type { LoginViewProps } from './login-view.types';

export function LoginView(props: LoginViewProps): React.JSX.Element {
  return (
    <PageShell title={props.labels.title} testId={TEST_IDS.loginPage} immersive>
      <main className="app-auth-layout">
        <section className="app-auth-panel" aria-labelledby="login-heading">
          <header className="app-auth-panel__header">
            <BrandLogo label={props.labels.logoLabel} size="lg" />
            <h1 id="login-heading" className="m-0 text-3xl font-bold">
              {props.labels.title}
            </h1>
          </header>
          <LoginForm
            labels={props.labels}
            email={props.form.email}
            password={props.form.password}
            passwordRevealed={props.form.passwordRevealed}
            onTogglePasswordReveal={props.form.onTogglePasswordReveal}
            onSubmit={props.form.onSubmit}
            isSubmitting={props.isSubmitting}
            submitErrorMessage={props.submitErrorMessage}
          />
          <AppButton
            label={props.labels.forgotPassword}
            tone="secondary"
            expand
            onClick={props.onForgotPassword}
            testId={TEST_IDS.loginForgotPasswordLink}
          />
        </section>
      </main>
    </PageShell>
  );
}
