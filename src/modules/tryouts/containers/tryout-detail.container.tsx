import { TryoutDetailView } from '../components/tryout-detail-view';
import { useTryoutWorkspace } from '../hooks/use-tryout-workspace.hook';

/** The staff tryout workspace screen. */
export function TryoutDetailContainer(): React.JSX.Element {
  const view = useTryoutWorkspace();
  return <TryoutDetailView {...view} />;
}
