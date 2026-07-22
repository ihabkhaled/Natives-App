import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AvatarFallback, LoadingState, PageShell } from '@/shared/ui';

import { HOME_VIEW_TEST_IDS } from './home-view.constants';
import type { HomeViewProps } from './home-view.types';

export function HomeView(props: HomeViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.homePage}>
      <main className="app-home-layout">
        <header className="app-home-hero">
          <div className="app-home-hero__intro">
            {props.isLoadingUser ? (
              <LoadingState label={props.loadingLabel} variant="card" />
            ) : (
              <>
                <AvatarFallback
                  name={props.userName ?? undefined}
                  label={props.avatarLabel}
                  size="lg"
                />
                <IonText>
                  <h2
                    className="app-home-hero__greeting m-0"
                    data-testid={HOME_VIEW_TEST_IDS.greeting}
                  >
                    {props.greeting}
                  </h2>
                </IonText>
              </>
            )}
          </div>
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
        {props.showsNoAccessNotice ? (
          <section
            className="app-home-no-access"
            role="note"
            aria-label={props.noAccessTitle}
            data-testid={HOME_VIEW_TEST_IDS.noAccess}
          >
            <IonText>
              <h3 className="m-0">{props.noAccessTitle}</h3>
            </IonText>
            <IonNote>{props.noAccessMessage}</IonNote>
          </section>
        ) : null}
        {props.dashboardSlot}
        <aside className="app-home-health">{props.healthSlot}</aside>
      </main>
    </PageShell>
  );
}
