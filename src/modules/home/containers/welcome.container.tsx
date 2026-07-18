import { WelcomeView } from '../components/welcome-view';
import { useWelcomeScreen } from '../hooks/use-welcome-screen.hook';

export function WelcomeContainer(): React.JSX.Element {
  const screen = useWelcomeScreen();
  return <WelcomeView {...screen} />;
}
