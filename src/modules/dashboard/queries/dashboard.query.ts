import { getDashboardSummary } from '../services/get-dashboard-summary.service';
import { dashboardQueryKeys } from './dashboard.keys';

/** Query options builder: the principal's dashboard summary projection. */
export function buildDashboardSummaryQueryOptions() {
  return {
    queryKey: dashboardQueryKeys.summary(),
    queryFn: () => getDashboardSummary(),
  };
}
