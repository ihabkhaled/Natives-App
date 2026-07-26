import { REPORTS_FILTER_ALL } from '../constants/reports.constants';
import { resolvePollInterval } from '../helpers/reports-poll.helper';
import { getReportJob } from '../services/get-report-job.service';
import { listReportJobs } from '../services/list-report-jobs.service';
import type { ReportJobsFilters, ReportJobsPage } from '../types/reports.types';
import { reportsQueryKeys } from './reports.keys';

/**
 * Query options for the polled job list — the first `refetchInterval` in the
 * app. The interval is the pure poll helper's decision (4 s active, 15 s
 * degraded, `false` when idle or offline) and background refetching stays
 * off, so a hidden tab never polls.
 */
export function buildReportJobsQueryOptions(
  teamId: string,
  filters: ReportJobsFilters,
  offset: number,
  poll: { readonly activeSinceMs: number | null; readonly isOffline: boolean },
) {
  return {
    queryKey: reportsQueryKeys.jobs(
      teamId,
      filters.template ?? REPORTS_FILTER_ALL,
      filters.status ?? REPORTS_FILTER_ALL,
      offset,
    ),
    queryFn: () => listReportJobs(teamId, filters, offset),
    enabled: teamId !== '',
    refetchIntervalInBackground: false,
    refetchInterval: (query: { state: { data?: ReportJobsPage | undefined } }) =>
      resolvePollInterval(
        query.state.data?.jobs ?? [],
        poll.activeSinceMs,
        Date.now(),
        poll.isOffline,
      ),
  };
}

/** Query options for one deep-linked job row. */
export function buildReportJobQueryOptions(teamId: string, jobId: string) {
  return {
    queryKey: reportsQueryKeys.job(teamId, jobId),
    queryFn: () => getReportJob(teamId, jobId),
    enabled: teamId !== '' && jobId !== '',
  };
}
