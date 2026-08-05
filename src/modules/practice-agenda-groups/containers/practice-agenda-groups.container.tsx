import { useRouteParam } from '@/packages/router';

import { PracticeAgendaGroupsView } from '../components/practice-agenda-groups-view';
import { usePracticeAgendaGroupsScreen } from '../hooks/use-practice-agenda-groups-screen.hook';
import { PRACTICE_AGENDA_GROUPS_SESSION_ID_PARAM } from '../routes/practice-agenda-groups.paths';

/** Routed groups-and-plan screen; the session id comes from the deep link. */
export function PracticeAgendaGroupsContainer(): React.JSX.Element {
  const sessionId = useRouteParam(PRACTICE_AGENDA_GROUPS_SESSION_ID_PARAM) ?? '';
  const view = usePracticeAgendaGroupsScreen(sessionId);
  return <PracticeAgendaGroupsView {...view} />;
}
