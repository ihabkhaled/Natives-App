import { PublicCompetitionsView } from '../components/public-competitions-view';
import { usePublicCompetitionsScreen } from '../hooks/use-public-competitions-screen.hook';

/** Public competitions index: view model in, presentational component out. */
export function PublicCompetitionsContainer(): React.JSX.Element {
  const screen = usePublicCompetitionsScreen();
  return <PublicCompetitionsView {...screen} />;
}
