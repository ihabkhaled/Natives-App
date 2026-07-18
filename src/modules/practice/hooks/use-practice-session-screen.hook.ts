import { useRouteParam } from '@/packages/router';

import { PRACTICE_SESSION_ID_PARAM } from '../routes/practice.paths';
import type { PracticeSessionScreenView } from '../types/practice-view.types';
import { usePracticeSessionDetails } from './use-practice-session-details.hook';

/** Adapts the routed session id into the prepared detail-screen hook. */
export function usePracticeSessionScreen(): PracticeSessionScreenView {
  const sessionId = useRouteParam(PRACTICE_SESSION_ID_PARAM) ?? '';
  return usePracticeSessionDetails(sessionId);
}
