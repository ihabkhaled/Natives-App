import { CompetitionsView } from '../components/competitions-view';
import { useCompetitionsList } from '../hooks/use-competitions-list.hook';

/** The competition list screen. */
export function CompetitionsContainer(): React.JSX.Element {
  const view = useCompetitionsList();
  return <CompetitionsView {...view} />;
}
