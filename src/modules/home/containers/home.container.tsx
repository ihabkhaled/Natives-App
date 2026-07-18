import { DashboardContainer } from '@/modules/dashboard';
import { HealthCardContainer } from '@/modules/health';

import { HomeView } from '../components/home-view';
import { useHomeScreen } from '../hooks/use-home-screen.hook';

export function HomeContainer(): React.JSX.Element {
  const screen = useHomeScreen();
  return (
    <HomeView
      {...screen}
      dashboardSlot={<DashboardContainer />}
      healthSlot={<HealthCardContainer />}
    />
  );
}
