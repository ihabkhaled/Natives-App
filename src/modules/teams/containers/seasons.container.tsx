import { SeasonsView } from '../components/seasons-view';
import { useSeasonsWorkspace } from '../hooks/use-seasons-workspace.hook';

/** Wires the seasons workspace hook to its presentational screen. */
export function SeasonsContainer(): React.JSX.Element {
  return <SeasonsView view={useSeasonsWorkspace()} />;
}
