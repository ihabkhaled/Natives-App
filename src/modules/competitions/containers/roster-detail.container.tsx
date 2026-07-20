import { RosterDetailView } from '../components/roster-detail-view';
import { useRosterWorkspace } from '../hooks/use-roster-workspace.hook';

/** The roster builder screen. */
export function RosterDetailContainer(): React.JSX.Element {
  const view = useRosterWorkspace();
  return <RosterDetailView {...view} />;
}
