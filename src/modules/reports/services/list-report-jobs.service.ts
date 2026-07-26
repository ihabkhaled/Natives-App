import { requestReportJobs } from '../gateways/reports.gateway';
import { runReportsRequest } from '../helpers/to-reports-error.helper';
import { mapReportJobsPage } from '../mappers/reports.mapper';
import type { ReportJobsFilters, ReportJobsPage } from '../types/reports.types';

/** Use case: one bounded, faceted page of the team's report jobs. */
export function listReportJobs(
  teamId: string,
  filters: ReportJobsFilters,
  offset: number,
): Promise<ReportJobsPage> {
  return runReportsRequest(async () =>
    mapReportJobsPage(await requestReportJobs(teamId, filters, offset)),
  );
}
