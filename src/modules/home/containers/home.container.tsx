import { DashboardContainer } from '@/modules/dashboard';
import { HealthCardContainer } from '@/modules/health';
import { practicesPath } from '@/modules/practice';
import { IonButton } from '@/packages/ionic';
import { useAppNavigation } from '@/packages/router';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { PageShell } from '@/shared/ui';

import { HomeView } from '../components/home-view';
import { useHomeScreen } from '../hooks/use-home-screen.hook';

export function HomeContainer(): React.JSX.Element {
  const screen = useHomeScreen();
  const navigation = useAppNavigation();
  return (
    <PageShell title={screen.title} testId={TEST_IDS.homePage}>
      <HomeView
        greeting={screen.greeting}
        isLoadingUser={screen.isLoadingUser}
        loadingLabel={screen.loadingLabel}
        logoutLabel={screen.logoutLabel}
        isLoggingOut={screen.isLoggingOut}
        onLogout={screen.onLogout}
        dashboardSlot={<DashboardContainer />}
        healthSlot={<HealthCardContainer />}
      />
      <IonButton
        fill="solid"
        expand="block"
        className="mt-2"
        onClick={() => {
          navigation.push(practicesPath());
        }}
        data-testid={TEST_IDS.homePracticeLink}
      >
        {screen.practiceCalendarLabel}
      </IonButton>
      <IonButton
        fill="clear"
        expand="block"
        className="mt-2"
        onClick={() => {
          navigation.push(APP_PATHS.sessions);
        }}
        data-testid={TEST_IDS.homeSessionsLink}
      >
        {screen.manageSessionsLabel}
      </IonButton>
      {/* Clears the fixed bottom navigation on compact viewports so the last
          action never sits beneath the tab bar. */}
      <div aria-hidden="true" className="h-20" />
    </PageShell>
  );
}
