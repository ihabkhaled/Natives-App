import { TeamDirectoryView } from '../components/team-directory-view';
import { useTeamDirectoryScreen } from '../hooks/use-team-directory-screen.hook';

/** Public team directory screen: view model in, presentational component out. */
export function TeamDirectoryContainer(): React.JSX.Element {
  const screen = useTeamDirectoryScreen();
  return <TeamDirectoryView {...screen} />;
}
