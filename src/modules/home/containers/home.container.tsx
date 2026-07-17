import { HealthCardContainer } from '@/modules/health';
import { TEST_IDS } from '@/shared/config';
import { PageShell } from '@/shared/ui';

import { HomeView } from '../components/home-view';
import { useHomeScreen } from '../hooks/use-home-screen.hook';

export function HomeContainer(): React.JSX.Element {
  const screen = useHomeScreen();
  return (
    <PageShell title={screen.title} testId={TEST_IDS.homePage}>
      <HomeView
        greeting={screen.greeting}
        isLoadingUser={screen.isLoadingUser}
        loadingLabel={screen.loadingLabel}
        logoutLabel={screen.logoutLabel}
        isLoggingOut={screen.isLoggingOut}
        onLogout={screen.onLogout}
        healthSlot={<HealthCardContainer />}
      />
    </PageShell>
  );
}
