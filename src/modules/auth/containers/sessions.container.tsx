import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { EmptyState, ErrorState, LoadingState, PageShell } from '@/shared/ui';

import { SessionList } from '../components/session-list';
import { useSessionsScreen, type SessionsScreenView } from '../hooks/use-sessions-screen.hook';

function sessionsBody(screen: SessionsScreenView): React.JSX.Element {
  if (screen.isLoading) {
    return <LoadingState label={screen.labels.loading} />;
  }
  if (screen.errorMessage !== undefined) {
    return (
      <ErrorState
        title={screen.labels.errorTitle}
        message={screen.errorMessage}
        retryLabel={screen.labels.retry}
        onRetry={screen.onRetry}
        testId={TEST_IDS.sessionsError}
      />
    );
  }
  if (screen.rows.length === 0) {
    return (
      <EmptyState
        title={screen.labels.emptyTitle}
        message={screen.labels.emptyMessage}
        testId={TEST_IDS.sessionsEmpty}
      />
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <IonText color="medium">
        <p className="m-0 text-sm">{screen.labels.intro}</p>
      </IonText>
      <SessionList
        rows={screen.rows}
        currentLabel={screen.labels.current}
        revokeLabel={screen.labels.revoke}
        revokeOthersLabel={screen.labels.revokeOthers}
        hasOtherSessions={screen.hasOtherSessions}
        isRevoking={screen.isRevoking}
        onRevoke={screen.onRevoke}
        onRevokeOthers={screen.onRevokeOthers}
      />
    </div>
  );
}

/** Session-management screen: list devices, revoke one, or revoke all others. */
export function SessionsContainer(): React.JSX.Element {
  const screen = useSessionsScreen();
  return (
    <PageShell title={screen.labels.title} testId={TEST_IDS.sessionsPage}>
      {sessionsBody(screen)}
    </PageShell>
  );
}
