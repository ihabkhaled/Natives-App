import { APP_ICONS } from '@/packages/icons';
import { IonIcon, IonNote, IonText } from '@/packages/ionic';
import { AppButton, StatusView } from '@/shared/ui';

import { AuthPanel } from '../auth-panel';
import { SignupForm } from '../signup-form';
import { SIGNUP_VIEW_TEST_IDS } from './signup-view.constants';
import type { SignupViewProps } from './signup-view.types';

/**
 * Presentational signup screen. Two states, never a third: the request form,
 * or the awaiting-approval confirmation. Success is NOT a session — the panel
 * says so and offers the way back to sign-in rather than pretending the user
 * is now inside the app.
 */
export function SignupView(props: SignupViewProps): React.JSX.Element {
  const signInAction = (
    <AppButton
      label={props.isAwaitingApproval ? props.copy.backToLogin : props.copy.haveAccount}
      tone="secondary"
      expand
      onClick={props.onBackToLogin}
      testId={SIGNUP_VIEW_TEST_IDS.signIn}
    />
  );
  return (
    <AuthPanel
      testId={SIGNUP_VIEW_TEST_IDS.page}
      title={props.copy.title}
      logoLabel={props.copy.logoLabel}
      headingId="signup-heading"
    >
      {props.isAwaitingApproval ? (
        <div className="flex flex-col gap-5">
          <StatusView
            icon={APP_ICONS.time}
            tone="warning"
            title={props.copy.pending.title}
            message={props.copy.pending.message}
            testId={SIGNUP_VIEW_TEST_IDS.pending}
          />
          <section aria-label={props.copy.pending.stepsTitle} className="flex flex-col gap-2">
            <IonNote className="text-xs font-bold uppercase">
              {props.copy.pending.stepsTitle}
            </IonNote>
            <ol
              className="m-0 flex list-none flex-col gap-2 p-0 text-sm"
              data-testid={SIGNUP_VIEW_TEST_IDS.pendingSteps}
            >
              {props.copy.pending.steps.map((step) => (
                <li key={step} className="flex items-start gap-2">
                  <IonIcon
                    icon={APP_ICONS.checkmark}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-(--ion-color-success)"
                  />
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
          {signInAction}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <IonText color="medium">
            <p className="m-0 text-center text-sm">{props.copy.intro}</p>
          </IonText>
          <SignupForm
            copy={props.copy.form}
            form={props.form}
            isSubmitting={props.isSubmitting}
            submitErrorMessage={props.submitErrorMessage}
          />
          {signInAction}
        </div>
      )}
    </AuthPanel>
  );
}
