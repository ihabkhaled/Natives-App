import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  reportDownloadPath,
  reportJobPath,
  reportRetryPath,
  reportsPath,
} from '../constants/reports-api.constants';
import { REPORTS_LIMITS } from '../constants/reports.constants';
import {
  listReportJobsResponseSchema,
  reportDownloadResponseSchema,
  reportJobResponseSchema,
} from '../schemas/reports.schema';
import type { GenerateReportCommand, ReportJobsFilters } from '../types/reports.types';

type JobDto = SchemaOutput<typeof reportJobResponseSchema>;
type JobsListDto = SchemaOutput<typeof listReportJobsResponseSchema>;
type DownloadDto = SchemaOutput<typeof reportDownloadResponseSchema>;

/** One bounded job page for the chosen facets. */
export function requestReportJobs(
  teamId: string,
  filters: ReportJobsFilters,
  offset: number,
): Promise<JobsListDto> {
  return getAppHttpClient().get(reportsPath(teamId), listReportJobsResponseSchema, {
    params: {
      limit: REPORTS_LIMITS.pageSize,
      offset,
      ...(filters.template === null ? {} : { template: filters.template }),
      ...(filters.status === null ? {} : { status: filters.status }),
    },
  });
}

/** One job row, for deep-linkable refresh. */
export function requestReportJob(teamId: string, jobId: string): Promise<JobDto> {
  return getAppHttpClient().get(reportJobPath(teamId, jobId), reportJobResponseSchema);
}

/** Queue a report; idempotent by request hash server-side. */
export function requestGenerateReport(
  teamId: string,
  command: GenerateReportCommand,
): Promise<JobDto> {
  return getAppHttpClient().post(reportsPath(teamId), command, reportJobResponseSchema);
}

/** Retry a failed job within its budget. */
export function requestRetryReport(teamId: string, jobId: string): Promise<JobDto> {
  return getAppHttpClient().post(reportRetryPath(teamId, jobId), {}, reportJobResponseSchema);
}

/**
 * Mint one fresh signed URL. Deliberately called per click and never cached —
 * every mint is audited server-side.
 */
export function requestDownloadTicket(teamId: string, jobId: string): Promise<DownloadDto> {
  return getAppHttpClient().get(reportDownloadPath(teamId, jobId), reportDownloadResponseSchema);
}
