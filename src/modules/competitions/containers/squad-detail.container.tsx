import { SquadDetailView } from '../components/squad-detail-view';
import { useSquadWorkspace } from '../hooks/use-squad-workspace.hook';

/** The squad workspace screen. */
export function SquadDetailContainer(): React.JSX.Element {
  const view = useSquadWorkspace();
  return <SquadDetailView {...view} />;
}
