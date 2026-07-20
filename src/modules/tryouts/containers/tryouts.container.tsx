import { TryoutsView } from '../components/tryouts-view';
import { useTryoutsList } from '../hooks/use-tryouts-list.hook';

/** The staff tryout event list screen. */
export function TryoutsContainer(): React.JSX.Element {
  const view = useTryoutsList();
  return <TryoutsView {...view} />;
}
