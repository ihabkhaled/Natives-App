import { AboutView } from '../components/about-view';
import { useAboutScreen } from '../hooks/use-about-screen.hook';

/** About Us screen: view model in, presentational component out. */
export function AboutContainer(): React.JSX.Element {
  const screen = useAboutScreen();
  return <AboutView {...screen} />;
}
