import { requestGenerateReport } from '../gateways/reports.gateway';
import { runReportsRequest } from '../helpers/to-reports-error.helper';
import { mapReportJob } from '../mappers/reports.mapper';
import type { GenerateReportCommand, ReportJob } from '../types/reports.types';

/** Use case: queue one report; duplicates converge on the idempotent job. */
export function generateReport(teamId: string, command: GenerateReportCommand): Promise<ReportJob> {
  return runReportsRequest(async () => mapReportJob(await requestGenerateReport(teamId, command)));
}
