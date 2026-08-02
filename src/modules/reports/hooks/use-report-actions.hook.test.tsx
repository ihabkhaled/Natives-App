import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/shared/errors/app.errors';
import { APP_ERROR_CODE } from '@/shared/errors';

import { generateReport } from '../services/generate-report.service';
import { retryReport } from '../services/retry-report.service';
import type { ReportJob } from '../types/reports.types';
import { useReportActions } from './use-report-actions.hook';

import {
  REPORTS_CONTEXT as context,
  reportsHookWrapper as wrapper,
  translateKey as t,
} from '../../../../tests/setup/reports-hook-harness.helper';

vi.mock('../services/generate-report.service', () => ({ generateReport: vi.fn() }));
vi.mock('../services/retry-report.service', () => ({ retryReport: vi.fn() }));
vi.mock('@/modules/teams', () => ({
  buildSeasonsQueryOptions: () => ({ queryKey: ['seasons'], queryFn: () => [], enabled: false }),
}));

function job(overrides: Partial<ReportJob>): ReportJob {
  return {
    jobId: 'job-1',
    seasonId: null,
    template: 'team_overview',
    format: 'csv',
    privacyClass: 'team',
    status: 'completed',
    progress: 100,
    retryCount: 0,
    calculationVersion: 'reports-v1',
    snapshotAtIso: '2026-07-20T09:00:00.000Z',
    checksum: 'abc123',
    rowCount: 12,
    failureReason: null,
    expiresAtIso: '2026-07-27T09:05:00.000Z',
    recordVersion: 1,
    createdAtIso: '2026-07-20T09:00:00.000Z',
    ...overrides,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useReportActions branch coverage', () => {
  it('banners a generic retry failure distinctly from a disallowed retry', async () => {
    vi.mocked(retryReport).mockRejectedValue(new Error('boom'));
    const onRefetch = vi.fn();
    const { result } = renderHook(
      () => useReportActions(t, { context, jobs: [job({})], onRefetch }),
      { wrapper },
    );

    act(() => {
      result.current.onRetry(job({ jobId: 'job-1', status: 'failed' }));
    });
    await waitFor(() => {
      expect(result.current.banner).toBe('reports.errorMessage');
    });
    expect(onRefetch).not.toHaveBeenCalled();
  });

  it('refetches and explains a disallowed retry', async () => {
    vi.mocked(retryReport).mockRejectedValue(
      new AppError({
        code: APP_ERROR_CODE.Conflict,
        message: 'nope',
        messageKey: 'errors.reports.retryNotAllowed',
      }),
    );
    const onRefetch = vi.fn();
    const { result } = renderHook(
      () => useReportActions(t, { context, jobs: [job({})], onRefetch }),
      { wrapper },
    );

    act(() => {
      result.current.onRetry(job({}));
    });
    await waitFor(() => {
      expect(result.current.banner).toBe('reports.retryNotAllowed');
    });
    expect(onRefetch).toHaveBeenCalled();
  });

  it('flags a duplicate submit that lands on an existing job', async () => {
    vi.mocked(generateReport).mockResolvedValue(job({ jobId: 'existing-1' }));
    const { result } = renderHook(
      () =>
        useReportActions(t, { context, jobs: [job({ jobId: 'existing-1' })], onRefetch: vi.fn() }),
      { wrapper },
    );

    act(() => result.current.requestPanel?.onSubmit());
    await waitFor(() => {
      expect(result.current.banner).toBe('reports.requestDuplicate');
    });
    expect(result.current.highlightedId).toBe('existing-1');
  });

  it('flags a fresh submit as newly queued and prefills a request-again', async () => {
    vi.mocked(generateReport).mockResolvedValue(job({ jobId: 'brand-new' }));
    const { result } = renderHook(
      () =>
        useReportActions(t, { context, jobs: [job({ jobId: 'existing-1' })], onRefetch: vi.fn() }),
      { wrapper },
    );

    act(() => {
      result.current.onRequestAgain(job({ template: 'roster' }));
    });
    expect(result.current.prefillTemplate).toBe('roster');
    act(() => result.current.requestPanel?.onSubmit());
    await waitFor(() => {
      expect(result.current.banner).toBe('reports.requestQueued');
    });
  });
});
