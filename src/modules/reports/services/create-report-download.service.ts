import { requestDownloadTicket } from '../gateways/reports.gateway';
import { runReportsRequest } from '../helpers/to-reports-error.helper';
import { mapDownloadTicket } from '../mappers/reports.mapper';
import type { ReportDownloadTicket } from '../types/reports.types';

/**
 * Use case: mint one fresh signed download URL. Called imperatively per
 * click and never cached — each mint is audited server-side.
 */
export function createReportDownload(teamId: string, jobId: string): Promise<ReportDownloadTicket> {
  return runReportsRequest(async () =>
    mapDownloadTicket(await requestDownloadTicket(teamId, jobId)),
  );
}
