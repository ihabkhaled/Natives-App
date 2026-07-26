import { requestRetryReport } from '../gateways/reports.gateway';
import { runReportsRequest } from '../helpers/to-reports-error.helper';
import { mapReportJob } from '../mappers/reports.mapper';
import type { ReportJob } from '../types/reports.types';

/** Use case: retry one failed job within its attempt budget. */
export function retryReport(teamId: string, jobId: string): Promise<ReportJob> {
  return runReportsRequest(async () => mapReportJob(await requestRetryReport(teamId, jobId)));
}
