import { JerseyView } from '../components/jersey-view';
import { useJerseyScreen } from '../hooks/use-jersey-screen.hook';

/** Composes the jersey orders screen. */
export function JerseyContainer(): React.JSX.Element {
  const view = useJerseyScreen();

  return <JerseyView {...view} />;
}
