import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { getDashboardSummary } from '../services/get-dashboard-summary.service';
import { useDashboardSummaryQuery } from './use-dashboard-summary-query.hook';

vi.mock('../services/get-dashboard-summary.service', () => ({ getDashboardSummary: vi.fn() }));

const SUMMARY = {
  persona: 'member',
  generatedAtIso: '2026-07-18T09:00:00.000Z',
  widgets: [],
} as const;

afterEach(() => {
  vi.clearAllMocks();
});

describe('useDashboardSummaryQuery', () => {
  it('starts pending with no summary and no error', () => {
    vi.mocked(getDashboardSummary).mockResolvedValue(SUMMARY);

    const { result } = renderHookWithProviders(() => useDashboardSummaryQuery());

    expect(result.current.summary).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('exposes the summary once it resolves', async () => {
    vi.mocked(getDashboardSummary).mockResolvedValue(SUMMARY);

    const { result } = renderHookWithProviders(() => useDashboardSummaryQuery());

    await waitFor(() => {
      expect(result.current.summary).toEqual(SUMMARY);
    });
    expect(result.current.error).toBeNull();
  });

  it('surfaces a failure as an AppError', async () => {
    vi.mocked(getDashboardSummary).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Forbidden }),
    );

    const { result } = renderHookWithProviders(() => useDashboardSummaryQuery());

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(AppError);
    });
    expect(result.current.error?.code).toBe(APP_ERROR_CODE.Forbidden);
  });

  it('normalizes a non-AppError failure into an AppError', async () => {
    vi.mocked(getDashboardSummary).mockRejectedValue(new Error('boom'));

    const { result } = renderHookWithProviders(() => useDashboardSummaryQuery());

    await waitFor(() => {
      expect(result.current.error?.code).toBe(APP_ERROR_CODE.Unexpected);
    });
  });

  it('refetches the summary on demand', async () => {
    vi.mocked(getDashboardSummary).mockResolvedValue(SUMMARY);

    const { result } = renderHookWithProviders(() => useDashboardSummaryQuery());
    await waitFor(() => {
      expect(result.current.summary).toEqual(SUMMARY);
    });

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(getDashboardSummary).toHaveBeenCalledTimes(2);
    });
  });
});
