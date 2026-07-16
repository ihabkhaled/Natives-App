import { getHealthStatus } from '../services/get-health.service';
import { healthQueryKeys } from './health.keys';

/** Query options builder: backend health status. */
export function buildHealthQueryOptions() {
  return {
    queryKey: healthQueryKeys.status(),
    queryFn: () => getHealthStatus(),
  };
}
