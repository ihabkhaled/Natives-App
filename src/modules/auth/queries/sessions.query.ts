import { listSessions } from '../services/list-sessions.service';
import { authQueryKeys } from './auth.keys';

/** Query options builder: the account's active device sessions. */
export function buildSessionsQueryOptions() {
  return {
    queryKey: authQueryKeys.sessions(),
    queryFn: () => listSessions(),
  };
}
