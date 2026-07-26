import { describe, expect, it } from 'vitest';

import type { ReportJob } from '../types/reports.types';
import {
  buildReportRowActions,
  buildReportStatusChip,
  formatExpiryCountdown,
} from './report-status-view.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

function job(overrides: Partial<ReportJob>): ReportJob {
  return {
    jobId: 'job-1',
    seasonId: null,
    template: 'attendance',
    format: 'csv',
    privacyClass: 'team',
    status: 'completed',
    progress: 100,
    retryCount: 0,
    calculationVersion: 'reports-v1',
    snapshotAtIso: '2026-07-20T09:00:00.000Z',
    checksum: 'sha256:abc',
    rowCount: 1245,
    failureReason: null,
    expiresAtIso: '2026-07-30T09:00:00.000Z',
    recordVersion: 1,
    createdAtIso: '2026-07-20T09:00:00.000Z',
    ...overrides,
  };
}

describe('buildReportStatusChip', () => {
  it('tones each lifecycle state', () => {
    expect(buildReportStatusChip(t, 'queued').tone).toBe('medium');
    expect(buildReportStatusChip(t, 'running').tone).toBe('warning');
    expect(buildReportStatusChip(t, 'completed').tone).toBe('success');
    expect(buildReportStatusChip(t, 'failed').tone).toBe('danger');
    expect(buildReportStatusChip(t, 'expired').tone).toBe('medium');
  });
});

describe('formatExpiryCountdown', () => {
  const now = Date.parse('2026-07-24T05:00:00.000Z');

  it('reports the remaining window in days and hours', () => {
    expect(formatExpiryCountdown(t, '2026-07-30T09:00:00.000Z', now)).toBe('reports.expiresIn:6,4');
  });

  it('reports a closed window once the expiry has passed', () => {
    expect(formatExpiryCountdown(t, '2026-07-19T09:00:00.000Z', now)).toBe('reports.expiredNotice');
  });
});

describe('buildReportRowActions', () => {
  it('shows the live progress for a running job', () => {
    const actions = buildReportRowActions(t, job({ status: 'running', progress: 40 }));
    expect(actions.showProgress).toBe(true);
    expect(actions.showDownload).toBe(false);
  });

  it('offers download for a completed job', () => {
    const actions = buildReportRowActions(t, job({ status: 'completed' }));
    expect(actions.showDownload).toBe(true);
  });

  it('offers retry while attempts remain, then request-again', () => {
    const retryable = buildReportRowActions(t, job({ status: 'failed', retryCount: 1 }));
    expect(retryable.showRetry).toBe(true);
    expect(retryable.retryLabel).toBe('reports.retryRemaining:2');

    const exhausted = buildReportRowActions(t, job({ status: 'failed', retryCount: 3 }));
    expect(exhausted.showRetry).toBe(false);
    expect(exhausted.showRequestAgain).toBe(true);
    expect(exhausted.requestAgainLabel).toBe('reports.requestAgain');
  });

  it('offers generate-again for an expired job', () => {
    const actions = buildReportRowActions(t, job({ status: 'expired' }));
    expect(actions.showRequestAgain).toBe(true);
    expect(actions.requestAgainLabel).toBe('reports.generateAgain');
  });
});
