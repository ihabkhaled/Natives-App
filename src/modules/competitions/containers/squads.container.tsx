import { SquadsView } from '../components/squads-view';
import { useSquadsList } from '../hooks/use-squads-list.hook';

/** The season squad list screen. */
export function SquadsContainer(): React.JSX.Element {
  const view = useSquadsList();
  return <SquadsView {...view} />;
}
