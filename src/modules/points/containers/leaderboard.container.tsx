import { LeaderboardScreen } from '../components/leaderboard-view';
import { useLeaderboard } from '../hooks/use-leaderboard.hook';

/** The team leaderboard screen. */
export function LeaderboardContainer(): React.JSX.Element {
  const view = useLeaderboard();
  return <LeaderboardScreen {...view} />;
}
