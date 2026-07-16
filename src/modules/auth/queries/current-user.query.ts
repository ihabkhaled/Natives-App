import { getCurrentUser } from '../services/get-current-user.service';
import { authQueryKeys } from './auth.keys';

/** Query options builder: current authenticated user. */
export function buildCurrentUserQueryOptions() {
  return {
    queryKey: authQueryKeys.currentUser(),
    queryFn: () => getCurrentUser(),
  };
}
