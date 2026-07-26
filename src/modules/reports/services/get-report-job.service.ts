import { requestReportJob } from '../gateways/reports.gateway';
import { runReportsRequest } from '../helpers/to-reports-error.helper';
import { mapReportJob } from '../mappers/reports.mapper';
import type { ReportJob } from '../types/reports.types';

/** Use case: one job row, for a deep-linkable refresh. */
export function getReportJob(teamId: string, jobId: string): Promise<ReportJob> {
  return runReportsRequest(async () => mapReportJob(await requestReportJob(teamId, jobId)));
}
