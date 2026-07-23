import { APP_ICONS } from '@/packages/icons';
import { TEST_IDS } from '@/shared/config';
import { AppButton, LoadingState, PageShell, StatusView } from '@/shared/ui';

import { AcceptInvitationView } from '../components/accept-invitation-view';
import { useAcceptInvitationScreen } from '../hooks/use-accept-invitation-screen.hook';

/** Invitation acceptance: loading, invalid-link, or the details + password form. */
export function AcceptInvitationContainer(): React.JSX.Element {
  const screen = useAcceptInvitationScreen();
  if (screen.isLoadingInvitation) {
    return (
      <PageShell title={screen.labels.title} testId={TEST_IDS.acceptInvitationPage}>
        <LoadingState label={screen.labels.loading} />
      </PageShell>
    );
  }
  if (
    screen.isInvitationInvalid ||
    screen.invitationEmail === undefined ||
    screen.introMessage === undefined
  ) {
    return (
      <PageShell title={screen.labels.title} testId={TEST_IDS.acceptInvitationPage}>
        <StatusView
          icon={APP_ICONS.warning}
          tone="warning"
          title={screen.labels.invalidTitle}
          message={screen.labels.invalidMessage}
          testId={TEST_IDS.acceptInvitationStatus}
          action={
            <AppButton
              label={screen.labels.backToLogin}
              tone="secondary"
              onClick={screen.onBackToLogin}
              testId={TEST_IDS.authBackToLoginLink}
            />
          }
        />
      </PageShell>
    );
  }
  return (
    <PageShell title={screen.labels.title} testId={TEST_IDS.acceptInvitationPage}>
      <AcceptInvitationView
        introMessage={screen.introMessage}
        emailLabel={screen.labels.emailLabel}
        invitationEmail={screen.invitationEmail}
        fieldsLabels={screen.labels.fields}
        form={screen.form}
        displayNameField={screen.displayNameField}
        isSubmitting={screen.isSubmitting}
        submitErrorMessage={screen.submitErrorMessage}
      />
    </PageShell>
  );
}
