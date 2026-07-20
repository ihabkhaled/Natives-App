import { RostersView } from '../components/rosters-view';
import { useRostersList } from '../hooks/use-rosters-list.hook';

/** The competition and match roster list screen. */
export function RostersContainer(): React.JSX.Element {
  const view = useRostersList();
  return <RostersView {...view} />;
}
