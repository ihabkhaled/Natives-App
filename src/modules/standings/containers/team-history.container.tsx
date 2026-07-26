import { TeamHistoryScreen } from '../components/team-history-view';
import { useTeamHistory } from '../hooks/use-team-history.hook';

/** The trophy cabinet screen. */
export function TeamHistoryContainer(): React.JSX.Element {
  const view = useTeamHistory();
  return <TeamHistoryScreen {...view} />;
}
