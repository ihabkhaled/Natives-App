import { renderHook } from '@testing-library/react';
import { createPlatformMock } from '../../../../tests/setup/platform-mock.helper';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import { useEffectivePermissions } from '@/modules/auth';
import { useAppNavigation, useRouteParam } from '@/packages/router';
import { useNetworkStatus } from '@/platform';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';
import { PERMISSIONS } from '@/shared/security';

import {
  buildAssessmentCatalog,
  buildAssessmentDetail,
} from '../../../../tests/factories/assessments.factory';
import {
  stubPermissions,
  stubTeamContext,
} from '../../../../tests/setup/assessments-hook-mocks.helper';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useAssessmentCatalogQuery } from './use-assessment-catalog-query.hook';
import { useAssessmentEntry } from './use-assessment-entry.hook';
import { useAssessmentQuery } from './use-assessment-query.hook';
import { useAssessmentRevisionsQuery } from './use-assessment-revisions-query.hook';
import { useAssessmentWorkflowActions } from './use-assessment-workflow-actions.hook';
import { useAssessmentsTeamContext } from './use-assessments-team-context.hook';

vi.mock('@/modules/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  useEffectivePermissions: vi.fn(),
}));
vi.mock('@/packages/router', () => ({ useAppNavigation: vi.fn(), useRouteParam: vi.fn() }));
vi.mock('@/platform', () => createPlatformMock());
vi.mock('./use-assessments-team-context.hook', () => ({ useAssessmentsTeamContext: vi.fn() }));
vi.mock('./use-assessment-query.hook', () => ({ useAssessmentQuery: vi.fn() }));
vi.mock('./use-assessment-catalog-query.hook', () => ({ useAssessmentCatalogQuery: vi.fn() }));
vi.mock('./use-assessment-revisions-query.hook', () => ({
  useAssessmentRevisionsQuery: vi.fn(),
}));
vi.mock('./use-assessment-workflow-actions.hook', () => ({
  useAssessmentWorkflowActions: vi.fn(),
}));

const push = vi.fn();
const refetch = vi.fn();
const save = vi.fn();
const run = vi.fn();

function mockDetail(overrides: Partial<ReturnType<typeof useAssessmentQuery>> = {}): void {
  vi.mocked(useAssessmentQuery).mockReturnValue({
    detail: buildAssessmentDetail(),
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
  vi.mocked(useRouteParam).mockReturnValue('asmt-draft-1');
  vi.mocked(useAppNavigation).mockReturnValue({
    push,
    replace: vi.fn(),
    goBack: vi.fn(),
    currentPath: '/assessments/asmt-draft-1',
  });
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  vi.mocked(useAssessmentsTeamContext).mockReturnValue(stubTeamContext());
  vi.mocked(useEffectivePermissions).mockReturnValue(
    stubPermissions([PERMISSIONS.assessmentReadTeam, PERMISSIONS.assessmentCreate]),
  );
  vi.mocked(useAssessmentCatalogQuery).mockReturnValue({
    catalog: buildAssessmentCatalog(),
    isLoading: false,
    error: null,
  });
  vi.mocked(useAssessmentRevisionsQuery).mockReturnValue({ revisions: [], isLoading: false });
  vi.mocked(useAssessmentWorkflowActions).mockReturnValue({
    save,
    isSaving: false,
    run,
    isTransitioning: false,
  });
  mockDetail();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useAssessmentEntry', () => {
  it('prepares the ready grid with completeness and the permitted step', () => {
    const { result } = renderHook(() => useAssessmentEntry());

    expect(result.current.status).toBe('ready');
    expect(result.current.groups).toHaveLength(2);
    expect(result.current.completenessValue).toBe('2 of 3 metrics evaluated');
    expect(result.current.workflowActions.map((action) => action.step)).toEqual(['submit']);
  });

  it('saves the draft with the current record version and only touched values', () => {
    const { result } = renderHook(() => useAssessmentEntry());

    result.current.onSave();

    expect(save).toHaveBeenCalledExactlyOnceWith({
      summary: null,
      values: [
        {
          metricDefinitionId: 'metric-attitude',
          numericValue: 0,
          textValue: null,
          note: null,
        },
        { metricDefinitionId: 'metric-speed', numericValue: 4, textValue: null, note: null },
      ],
      expectedRecordVersion: 1,
    });
  });

  it('runs a workflow step against the current record version', () => {
    const { result } = renderHook(() => useAssessmentEntry());

    result.current.onWorkflowStep('submit');

    expect(run).toHaveBeenCalledExactlyOnceWith('submit', 1);
  });

  it('falls back to version zero before the record resolves', () => {
    mockDetail({ detail: undefined, isLoading: true });

    const { result } = renderHook(() => useAssessmentEntry());
    result.current.onSave();
    result.current.onWorkflowStep('submit');

    expect(save).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ expectedRecordVersion: 0 }),
    );
    expect(run).toHaveBeenCalledExactlyOnceWith('submit', 0);
  });

  it('returns to the workspace from the back action', () => {
    const { result } = renderHook(() => useAssessmentEntry());

    result.current.onBack();

    expect(push).toHaveBeenCalledExactlyOnceWith('/assessments');
  });

  it('presents a missing assessment as the not-found state', () => {
    mockDetail({ detail: undefined, error: new AppError({ code: APP_ERROR_CODE.NotFound }) });

    const { result } = renderHook(() => useAssessmentEntry());

    expect(result.current.status).toBe('empty');
    expect(result.current.emptyTitle).toBe('Assessment not found');
  });

  it('blocks a persona without the team grant', () => {
    vi.mocked(useEffectivePermissions).mockReturnValue(stubPermissions([]));

    const { result } = renderHook(() => useAssessmentEntry());

    expect(result.current.status).toBe('forbidden');
    expect(result.current.workflowActions).toEqual([]);
  });

  it('retries through the detail query', () => {
    const { result } = renderHook(() => useAssessmentEntry());

    result.current.onRetry();

    expect(refetch).toHaveBeenCalledOnce();
  });

  it('sends the typed summary once the evaluator writes one', () => {
    const { result, rerender } = renderHook(() => useAssessmentEntry());

    result.current.onSummaryChange('Strong block.');
    rerender();
    result.current.onSave();

    expect(save).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ summary: 'Strong block.' }),
    );
  });

  it('reports a saving label while the draft is in flight', () => {
    vi.mocked(useAssessmentWorkflowActions).mockReturnValue({
      save,
      isSaving: true,
      run,
      isTransitioning: false,
    });

    const { result } = renderHook(() => useAssessmentEntry());

    expect(result.current.saveLabel).toBe('Saving…');
    expect(result.current.isSaving).toBe(true);
  });

  it('reads an absent route parameter as no assessment', () => {
    vi.mocked(useRouteParam).mockReturnValue(null);
    mockDetail({ detail: undefined, isLoading: true });

    const { result } = renderHook(() => useAssessmentEntry());

    expect(result.current.status).toBe('loading');
  });
});
