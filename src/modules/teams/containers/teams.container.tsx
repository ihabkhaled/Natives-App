import { TeamsView } from '../components/teams-view';
import { useTeamsWorkspace } from '../hooks/use-teams-workspace.hook';

/** Wires the teams workspace hook to its presentational screen. */
export function TeamsContainer(): React.JSX.Element {
  return <TeamsView view={useTeamsWorkspace()} />;
}
