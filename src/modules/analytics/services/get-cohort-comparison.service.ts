import { requestCohortComparison } from '../gateways/analytics.gateway';
import { runAnalyticsRequest } from '../helpers/to-analytics-error.helper';
import { mapCohortComparison } from '../mappers/analytics.mapper';
import type { CohortComparison, CohortComparisonQuery } from '../types/analytics.types';

/** Use case: one cohort comparison; suppression arrives from the server. */
export function getCohortComparison(
  teamId: string,
  query: CohortComparisonQuery,
): Promise<CohortComparison> {
  return runAnalyticsRequest(async () =>
    mapCohortComparison(await requestCohortComparison(teamId, query)),
  );
}
