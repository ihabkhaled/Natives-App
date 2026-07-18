import { getPracticeSession } from '../services/get-practice-session.service';
import { practiceQueryKeys } from './practice.keys';

/** Query options for one practice session detail. */
export function buildPracticeSessionQueryOptions(sessionId: string) {
  return {
    queryKey: practiceQueryKeys.detail(sessionId),
    queryFn: () => getPracticeSession(sessionId),
    enabled: sessionId !== '',
  };
}
