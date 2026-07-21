import { MatchesView } from '../components/matches-view';
import { useMatchesList } from '../hooks/use-matches-list.hook';

export function MatchesContainer(): React.JSX.Element {
  const view = useMatchesList();
  return <MatchesView {...view} />;
}
