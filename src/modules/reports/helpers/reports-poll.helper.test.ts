import { describe, expect, it } from 'vitest';

import { REPORTS_POLL } from '../constants/reports.constants';
import type { ReportJob } from '../types/reports.types';
import {
  hasActiveJob,
  isPollDegraded,
  nextActiveSince,
  resolveJobsPage,
  resolvePollInterval,
} from './reports-poll.helper';

function job(status: ReportJob['status']): ReportJob {
  return {
    jobId: `job-${status}`,
    seasonId: null,
    template: 'team_overview',
    format: 'csv',
    privacyClass: 'team',
    status,
    progress: status === 'running' ? 50 : 0,
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

const NOW = 1_000_000;

describe('hasActiveJob', () => {
  it('is true while any job is queued or running', () => {
    expect(hasActiveJob([job('completed'), job('running')])).toBe(true);
    expect(hasActiveJob([job('queued')])).toBe(true);
  });

  it('is false when every job is terminal', () => {
    expect(hasActiveJob([job('completed'), job('failed'), job('expired')])).toBe(false);
    expect(hasActiveJob([])).toBe(false);
  });
});

describe('resolvePollInterval', () => {
  it('does not poll when idle or offline', () => {
    expect(resolvePollInterval([job('completed')], null, NOW, false)).toBe(false);
    expect(resolvePollInterval([job('running')], null, NOW, true)).toBe(false);
  });

  it('polls at the active interval while a job is running', () => {
    expect(resolvePollInterval([job('running')], NOW, NOW, false)).toBe(REPORTS_POLL.activeMs);
  });

  it('degrades to the slow interval after the slow threshold', () => {
    const since = NOW - REPORTS_POLL.slowAfterMs;
    expect(resolvePollInterval([job('running')], since, NOW, false)).toBe(REPORTS_POLL.slowMs);
  });
});

describe('nextActiveSince', () => {
  it('clears the clock once every job is terminal', () => {
    expect(nextActiveSince([job('completed')], NOW, NOW)).toBeNull();
  });

  it('starts the clock on first activity and keeps it after', () => {
    expect(nextActiveSince([job('running')], null, NOW)).toBe(NOW);
    expect(nextActiveSince([job('running')], NOW - 5, NOW)).toBe(NOW - 5);
  });
});

describe('isPollDegraded', () => {
  it('is true only after continuous activity past the threshold and online', () => {
    const since = NOW - REPORTS_POLL.slowAfterMs;
    expect(isPollDegraded([job('running')], since, NOW, false)).toBe(true);
    expect(isPollDegraded([job('running')], since, NOW, true)).toBe(false);
    expect(isPollDegraded([job('running')], NOW, NOW, false)).toBe(false);
    expect(isPollDegraded([job('completed')], since, NOW, false)).toBe(false);
    expect(isPollDegraded([job('running')], null, NOW, false)).toBe(false);
  });
});

describe('resolveJobsPage', () => {
  it('defaults to an empty page before the first load', () => {
    expect(resolveJobsPage(undefined)).toEqual({ jobs: [], total: 0 });
  });

  it('reads the jobs and total of a loaded page', () => {
    const page = { jobs: [job('completed')], total: 5, limit: 20, offset: 0 };
    expect(resolveJobsPage(page)).toEqual({ jobs: page.jobs, total: 5 });
  });
});
