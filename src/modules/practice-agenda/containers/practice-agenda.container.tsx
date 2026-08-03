import { PracticeAgendaView } from '../components/practice-agenda-view';
import { usePracticeAgendaRouteScreen } from '../hooks/use-practice-agenda-route-screen.hook';

/** Composes the plan for the session named in the route. */
export function PracticeAgendaContainer(): React.JSX.Element {
  const view = usePracticeAgendaRouteScreen();

  return <PracticeAgendaView {...view} />;
}
