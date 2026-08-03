import { useRouteParam } from '@/packages/router';

import { PRACTICE_AGENDA_SESSION_ID_PARAM } from '../routes/practice-agenda.paths';
import type { PracticeAgendaScreenView } from '../types/practice-agenda-view.types';
import { usePracticeAgendaScreen } from './use-practice-agenda-screen.hook';

/** Binds the routed `:sessionId` to the screen; the plan has no meaning without one. */
export function usePracticeAgendaRouteScreen(): PracticeAgendaScreenView {
  const sessionId = useRouteParam(PRACTICE_AGENDA_SESSION_ID_PARAM) ?? '';
  return usePracticeAgendaScreen(sessionId);
}
