import { afterEach, describe, expect, it, vi } from 'vitest';

import { REPORTS_POLL } from '../constants/reports.constants';
import { getReportJob } from '../services/get-report-job.service';
import { listReportJobs } from '../services/list-report-jobs.service';
import type { ReportJob, ReportJobsPage } from '../types/reports.types';
import { reportsQueryKeys } from './reports.keys';
import { buildReportJobQueryOptions, buildReportJobsQueryOptions } from './reports.query';

vi.mock('../services/list-report-jobs.service', () => ({ listReportJobs: vi.fn() }));
vi.mock('../services/get-report-job.service', () => ({ getReportJob: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

function runningJob(): ReportJob {
  return {
    jobId: 'j1',
    seasonId: null,
    template: 'team_overview',
    format: 'csv',
    privacyClass: 'team',
    status: 'running',
    progress: 40,
    retryCount: 0,
    calculationVersion: 'reports-v1',
    snapshotAtIso: '2026-07-20T09:00:00.000Z',
    checksum: null,
    rowCount: null,
    failureReason: null,
    expiresAtIso: '2026-07-30T09:00:00.000Z',
    recordVersion: 1,
    createdAtIso: '2026-07-20T09:00:00.000Z',
  };
}

function pageWith(jobs: readonly ReportJob[]): ReportJobsPage {
  return { jobs, total: jobs.length, limit: 20, offset: 0 };
}

type Options = ReturnType<typeof buildReportJobsQueryOptions>;

function interval(options: Options, data: ReportJobsPage | undefined): number | false {
  return (
    options.refetchInterval as (q: {
      state: { data: ReportJobsPage | undefined };
    }) => number | false
  )({
    state: { data },
  });
}

describe('reportsQueryKeys', () => {
  it('builds stable, team-scoped keys', () => {
    expect(reportsQueryKeys.jobs('t', 'all', 'all', 0)).toContain('jobs');
    expect(reportsQueryKeys.job('t', 'j')).toContain('job');
  });
});

describe('report jobs query options', () => {
  it('wires the list read and disables the row read until scoped', () => {
    void buildReportJobsQueryOptions('t', { template: null, status: null }, 0, {
      activeSinceMs: null,
      isOffline: false,
    }).queryFn();
    expect(listReportJobs).toHaveBeenCalledOnce();

    expect(buildReportJobQueryOptions('', 'j').enabled).toBe(false);
    void buildReportJobQueryOptions('t', 'j').queryFn();
    expect(getReportJob).toHaveBeenCalledOnce();
  });

  it('polls at the active interval while a visible job runs and stops when idle', () => {
    const options = buildReportJobsQueryOptions('t', { template: null, status: null }, 0, {
      activeSinceMs: Date.now(),
      isOffline: false,
    });
    expect(interval(options, pageWith([runningJob()]))).toBe(REPORTS_POLL.activeMs);
    expect(interval(options, pageWith([]))).toBe(false);
    expect(interval(options, undefined)).toBe(false);
  });

  it('degrades to the slow interval after continuous activity', () => {
    const options = buildReportJobsQueryOptions('t', { template: null, status: null }, 0, {
      activeSinceMs: Date.now() - REPORTS_POLL.slowAfterMs - 1000,
      isOffline: false,
    });
    expect(interval(options, pageWith([runningJob()]))).toBe(REPORTS_POLL.slowMs);
  });

  it('pauses polling while offline', () => {
    const options = buildReportJobsQueryOptions('t', { template: null, status: null }, 0, {
      activeSinceMs: Date.now(),
      isOffline: true,
    });
    expect(interval(options, pageWith([runningJob()]))).toBe(false);
  });
});
