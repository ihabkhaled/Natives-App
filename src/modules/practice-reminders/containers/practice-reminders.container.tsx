import { useRouteParam } from '@/packages/router';

import { PracticeRemindersView } from '../components/practice-reminders-view';
import { usePracticeRemindersScreen } from '../hooks/use-practice-reminders-screen.hook';
import { PRACTICE_REMINDERS_SESSION_ID_PARAM } from '../routes/practice-reminders.paths';

/** Routed reminders screen; the session id comes from the deep link. */
export function PracticeRemindersContainer(): React.JSX.Element {
  const sessionId = useRouteParam(PRACTICE_REMINDERS_SESSION_ID_PARAM) ?? '';
  const view = usePracticeRemindersScreen(sessionId);
  return <PracticeRemindersView {...view} />;
}
