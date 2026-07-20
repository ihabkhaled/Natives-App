import { renderHook } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import { useEffectivePermissions } from '@/modules/auth';
import { useAppNavigation } from '@/packages/router';
import { useNetworkStatus } from '@/platform';
import { PERMISSIONS } from '@/shared/security';

import {
  stubPermissions,
  stubTeamContext,
} from '../../../../tests/setup/assessments-hook-mocks.helper';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import {
  buildAssessmentCatalog,
  buildAssessmentSummary,
} from '../../../../tests/factories/assessments.factory';
import { useAssessmentCatalogQuery } from './use-assessment-catalog-query.hook';
import { useAssessmentsTeamContext } from './use-assessments-team-context.hook';
import { useAssessmentsWorkspace } from './use-assessments-workspace.hook';
import { useTeamAssessmentsQuery } from './use-team-assessments-query.hook';

vi.mock('@/modules/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  useEffectivePermissions: vi.fn(),
}));
vi.mock('@/packages/router', () => ({ useAppNavigation: vi.fn() }));
vi.mock('@/platform', () => ({ useNetworkStatus: vi.fn() }));
vi.mock('./use-assessments-team-context.hook', () => ({ useAssessmentsTeamContext: vi.fn() }));
vi.mock('./use-team-assessments-query.hook', () => ({ useTeamAssessmentsQuery: vi.fn() }));
vi.mock('./use-assessment-catalog-query.hook', () => ({ useAssessmentCatalogQuery: vi.fn() }));

const push = vi.fn();
const refetch = vi.fn();

function mockQuery(overrides: Partial<ReturnType<typeof useTeamAssessmentsQuery>> = {}): void {
  vi.mocked(useTeamAssessmentsQuery).mockReturnValue({
    page: { items: [buildAssessmentSummary()], total: 1, pageSize: 50, hasMore: false },
    isLoading: false,
    error: null,
    refetch,
    ...overrides,
  });
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.mocked(useAppNavigation).mockReturnValue({
    push,
    replace: vi.fn(),
    goBack: vi.fn(),
    currentPath: '/assessments',
  });
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  vi.mocked(useAssessmentsTeamContext).mockReturnValue(stubTeamContext());
  vi.mocked(useEffectivePermissions).mockReturnValue(
    stubPermissions([PERMISSIONS.assessmentReadTeam]),
  );
  vi.mocked(useAssessmentCatalogQuery).mockReturnValue({
    catalog: buildAssessmentCatalog(),
    isLoading: false,
    error: null,
  });
  mockQuery();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useAssessmentsWorkspace', () => {
  it('prepares a ready list with a translated count and period names', () => {
    const { result } = renderHook(() => useAssessmentsWorkspace());

    expect(result.current.status).toBe('ready');
    expect(result.current.countLabel).toBe('1 of 1 assessments');
    expect(result.current.items[0]?.periodLabel).toBe('Summer 2026');
  });

  it('narrows the list through the status filter', () => {
    mockQuery({
      page: {
        items: [
          buildAssessmentSummary(),
          buildAssessmentSummary({ id: 'a2', status: 'published' }),
        ],
        total: 2,
        pageSize: 50,
        hasMore: false,
      },
    });
    const { result, rerender } = renderHook(() => useAssessmentsWorkspace());

    result.current.onStatusFilterChange('published');
    rerender();

    expect(result.current.items.map((item) => item.id)).toEqual(['a2']);
    expect(result.current.hasMatches).toBe(true);
  });

  it('reports no matches when a filter hides everything', () => {
    const { result, rerender } = renderHook(() => useAssessmentsWorkspace());

    result.current.onStatusFilterChange('published');
    rerender();

    expect(result.current.hasMatches).toBe(false);
  });

  it('blocks a persona without the team grant', () => {
    vi.mocked(useEffectivePermissions).mockReturnValue(stubPermissions([]));

    const { result } = renderHook(() => useAssessmentsWorkspace());

    expect(result.current.status).toBe('forbidden');
  });

  it('surfaces a translated error and its retry', () => {
    mockQuery({ page: undefined, error: { code: 'SERVER_ERROR' } as never });

    const { result } = renderHook(() => useAssessmentsWorkspace());

    expect(result.current.status).toBe('error');
    expect(result.current.errorMessage).not.toBe('');
    result.current.onRetry();
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('reports offline once loading settles with nothing cached', () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    mockQuery({ page: undefined });

    const { result } = renderHook(() => useAssessmentsWorkspace());

    expect(result.current.status).toBe('offline');
    expect(result.current.isOffline).toBe(true);
  });

  it('navigates to the entry screen for the opened assessment', () => {
    const { result } = renderHook(() => useAssessmentsWorkspace());

    result.current.onOpen('asmt-draft-1');

    expect(push).toHaveBeenCalledExactlyOnceWith('/assessments/asmt-draft-1');
  });
});
