import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useAppQuery } from '@/packages/query';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { useAssessmentCatalogQuery } from './use-assessment-catalog-query.hook';
import { useAssessmentQuery } from './use-assessment-query.hook';
import { useAssessmentRevisionsQuery } from './use-assessment-revisions-query.hook';
import { useMyPerformanceQuery } from './use-my-performance-query.hook';
import { useTeamAssessmentsQuery } from './use-team-assessments-query.hook';

vi.mock('@/packages/query', () => ({ useAppQuery: vi.fn() }));

const refetch = vi.fn();

function queryResult(overrides: Record<string, unknown> = {}) {
  return { data: undefined, isPending: false, error: null, refetch, ...overrides };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('assessment query hooks', () => {
  it('exposes the team page, its pending flag, and a void-returning refetch', () => {
    vi.mocked(useAppQuery).mockReturnValue(
      queryResult({ data: { items: [], total: 0, pageSize: 50, hasMore: false } }) as never,
    );

    const { result } = renderHook(() => useTeamAssessmentsQuery('t'));

    expect(result.current.page?.total).toBe(0);
    expect(result.current.isLoading).toBe(false);
    result.current.refetch();
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('normalizes a team-page failure into an AppError', () => {
    vi.mocked(useAppQuery).mockReturnValue(
      queryResult({ error: new AppError({ code: APP_ERROR_CODE.Server }) }) as never,
    );

    const { result } = renderHook(() => useTeamAssessmentsQuery('t'));

    expect(result.current.error?.code).toBe(APP_ERROR_CODE.Server);
  });

  it('normalizes a detail failure and forwards its refetch', () => {
    vi.mocked(useAppQuery).mockReturnValue(
      queryResult({ error: new AppError({ code: APP_ERROR_CODE.NotFound }) }) as never,
    );

    const { result } = renderHook(() => useAssessmentQuery('t', 'a'));

    expect(result.current.detail).toBeUndefined();
    expect(result.current.error?.code).toBe(APP_ERROR_CODE.NotFound);
    result.current.refetch();
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('normalizes a catalog failure', () => {
    vi.mocked(useAppQuery).mockReturnValue(
      queryResult({ error: new AppError({ code: APP_ERROR_CODE.Forbidden }) }) as never,
    );

    const { result } = renderHook(() => useAssessmentCatalogQuery('t'));

    expect(result.current.error?.code).toBe(APP_ERROR_CODE.Forbidden);
  });

  it('reports no catalog error on a clean read', () => {
    vi.mocked(useAppQuery).mockReturnValue(queryResult({ data: { templates: [] } }) as never);

    const { result } = renderHook(() => useAssessmentCatalogQuery('t'));

    expect(result.current.error).toBeNull();
  });

  it('degrades a revision failure to an empty family', () => {
    vi.mocked(useAppQuery).mockReturnValue(queryResult({ isPending: true }) as never);

    const { result } = renderHook(() => useAssessmentRevisionsQuery('t', 'a'));

    expect(result.current.revisions).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('gates the performance screen on the published assessments only', () => {
    vi.mocked(useAppQuery)
      .mockReturnValueOnce(
        queryResult({ error: new AppError({ code: APP_ERROR_CODE.Server }) }) as never,
      )
      .mockReturnValueOnce(queryResult({ isPending: true }) as never)
      .mockReturnValueOnce(queryResult() as never);

    const { result } = renderHook(() => useMyPerformanceQuery('t'));

    expect(result.current.error?.code).toBe(APP_ERROR_CODE.Server);
    expect(result.current.feedback).toEqual([]);
    expect(result.current.goals).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('refetches all three own-scope collections together', () => {
    vi.mocked(useAppQuery).mockReturnValue(queryResult({ data: [] }) as never);

    const { result } = renderHook(() => useMyPerformanceQuery('t'));
    result.current.refetch();

    expect(refetch).toHaveBeenCalledTimes(3);
    expect(result.current.error).toBeNull();
  });
});
