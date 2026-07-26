import { TeamAnalyticsScreen } from '../components/team-analytics-view';
import { useTeamAnalytics } from '../hooks/use-team-analytics.hook';

/** The team analytics screen. */
export function TeamAnalyticsContainer(): React.JSX.Element {
  const view = useTeamAnalytics();
  return <TeamAnalyticsScreen {...view} />;
}
