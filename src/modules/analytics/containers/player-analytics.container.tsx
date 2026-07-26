import { PlayerAnalyticsScreen } from '../components/player-analytics-view';
import { usePlayerAnalytics } from '../hooks/use-player-analytics.hook';

/** One player's analytics screen. */
export function PlayerAnalyticsContainer(): React.JSX.Element {
  const view = usePlayerAnalytics();
  return <PlayerAnalyticsScreen {...view} />;
}
