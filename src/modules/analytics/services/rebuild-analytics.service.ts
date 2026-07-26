import { requestRebuildAnalytics } from '../gateways/analytics.gateway';
import { runAnalyticsRequest } from '../helpers/to-analytics-error.helper';
import { mapRebuildReport } from '../mappers/analytics.mapper';
import type { AnalyticsRebuildReport, RebuildAnalyticsCommand } from '../types/analytics.types';

/** Use case: one idempotent projection rebuild with its reconciliation report. */
export function rebuildAnalytics(
  teamId: string,
  command: RebuildAnalyticsCommand,
): Promise<AnalyticsRebuildReport> {
  return runAnalyticsRequest(async () =>
    mapRebuildReport(await requestRebuildAnalytics(teamId, command)),
  );
}
