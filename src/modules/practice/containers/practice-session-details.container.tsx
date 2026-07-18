import { PracticeSessionDetailsView } from '../components/practice-session-details-view';
import { usePracticeSessionScreen } from '../hooks/use-practice-session-screen.hook';

/** Routed practice session-detail screen; the id comes from the deep link. */
export function PracticeSessionDetailsContainer(): React.JSX.Element {
  const view = usePracticeSessionScreen();
  return <PracticeSessionDetailsView {...view} />;
}
