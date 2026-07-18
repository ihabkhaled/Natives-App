import { DashboardView } from '../components/dashboard-view';
import { useDashboard } from '../hooks/use-dashboard.hook';

/** Embeddable personalized dashboard (rendered by the home screen). */
export function DashboardContainer(): React.JSX.Element {
  const view = useDashboard();
  return <DashboardView {...view} />;
}
