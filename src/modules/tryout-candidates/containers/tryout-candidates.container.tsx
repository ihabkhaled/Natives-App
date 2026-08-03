import { TryoutCandidatesView } from '../components/tryout-candidates-view';
import { useTryoutCandidatesScreen } from '../hooks/use-tryout-candidates-screen.hook';

/** Composes the staff review of tryout candidates. */
export function TryoutCandidatesContainer(): React.JSX.Element {
  const view = useTryoutCandidatesScreen();

  return <TryoutCandidatesView {...view} />;
}
