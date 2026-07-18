import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import { DASHBOARD_API_PATHS } from '../constants/dashboard-api.constants';
import { dashboardSummaryResponseSchema } from '../schemas/dashboard-summary.schema';

/** Dashboard summary gateway: one authenticated projection call, schema-parsed. */
export function requestDashboardSummary(): Promise<
  SchemaOutput<typeof dashboardSummaryResponseSchema>
> {
  return getAppHttpClient().get(DASHBOARD_API_PATHS.summary, dashboardSummaryResponseSchema);
}
