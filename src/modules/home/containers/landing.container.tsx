import { LandingView } from '../components/landing-view';
import { useLandingScreen } from '../hooks/use-landing-screen.hook';

/** Public landing page at `/`: view model in, presentational component out. */
export function LandingContainer(): React.JSX.Element {
  const screen = useLandingScreen();
  return <LandingView {...screen} />;
}
