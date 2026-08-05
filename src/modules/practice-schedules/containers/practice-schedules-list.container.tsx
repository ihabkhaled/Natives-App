import { PracticeSchedulesView } from '../components/practice-schedules-view';
import { usePracticeSchedulesListScreen } from '../hooks/use-practice-schedules-list-screen.hook';

/** Routed list of a team's recurring practice patterns. */
export function PracticeSchedulesListContainer(): React.JSX.Element {
  const view = usePracticeSchedulesListScreen();
  return <PracticeSchedulesView {...view} />;
}
