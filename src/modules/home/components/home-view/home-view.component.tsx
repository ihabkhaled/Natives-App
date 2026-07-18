import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, LoadingState, PageShell } from '@/shared/ui';

import { HOME_VIEW_TEST_IDS } from './home-view.constants';
import type { HomeViewProps } from './home-view.types';

export function HomeView(props: HomeViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.homePage}>
      <main className="app-home-layout">
        <header className="app-home-hero">
          {props.isLoadingUser ? (
            <LoadingState label={props.loadingLabel} variant="card" />
          ) : (
            <IonText>
              <h2 className="m-0 text-2xl font-bold" data-testid={HOME_VIEW_TEST_IDS.greeting}>
                {props.greeting}
              </h2>
            </IonText>
          )}
          <div className="app-home-hero__actions">
            <AppButton
              label={props.practiceCalendarLabel}
              onClick={props.onOpenPracticeCalendar}
              testId={HOME_VIEW_TEST_IDS.practice}
            />
            <AppButton
              label={props.manageSessionsLabel}
              tone="secondary"
              onClick={props.onManageSessions}
              testId={HOME_VIEW_TEST_IDS.sessions}
            />
          </div>
        </header>
        {props.dashboardSlot}
        <aside className="app-home-health">{props.healthSlot}</aside>
        <AppButton
          label={props.logoutLabel}
          tone="secondary"
          onClick={props.onLogout}
          loading={props.isLoggingOut}
          testId={HOME_VIEW_TEST_IDS.logout}
        />
        <div aria-hidden="true" className="h-16" />
      </main>
    </PageShell>
  );
}
