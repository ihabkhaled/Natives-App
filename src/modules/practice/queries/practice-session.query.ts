import { getPracticeSession } from '../services/get-practice-session.service';
import { practiceQueryKeys } from './practice.keys';

/** Query options for one practice session detail. */
export function buildPracticeSessionQueryOptions(teamId: string, sessionId: string) {
  return {
    queryKey: practiceQueryKeys.detail(teamId, sessionId),
    queryFn: () => getPracticeSession(teamId, sessionId),
    enabled: teamId !== '' && sessionId !== '',
  };
}
