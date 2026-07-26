import { describe, expect, it, vi } from 'vitest';

import type { RemoteQueryView } from '@/shared/view';

import type { ReportJob, ReportJobsPage } from '../types/reports.types';
import { findCatalogEntry, resolveDefaultFormat } from './report-request-form.helper';
import {
  buildReportJobRowView,
  buildStatusFilterOptions,
  buildTemplateFilterOptions,
} from './report-jobs-view.helper';
import { buildReportsScreenView } from './reports-screen-view.helper';
import { buildRequestPanelView, coerceFormat } from './report-request-view.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

function job(overrides: Partial<ReportJob>): ReportJob {
  return {
    jobId: 'j1',
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
    rowCount: 12,
    failureReason: null,
    expiresAtIso: '2026-07-30T09:00:00.000Z',
    recordVersion: 1,
    createdAtIso: '2026-07-20T09:00:00.000Z',
    ...overrides,
  };
}

const rowInputs = {
  nowMs: Date.parse('2026-07-24T05:00:00.000Z'),
  locale: 'en',
  highlightedId: 'j1',
  expandedId: 'j1',
  downloadingId: '',
  actionsAllowed: true,
  canGenerate: true,
  onDownload: vi.fn(),
  onRetry: vi.fn(),
  onRequestAgain: vi.fn(),
  onToggleExpand: vi.fn(),
};

describe('report filter options', () => {
  it('build with an "all" head', () => {
    expect(buildTemplateFilterOptions(t)[0]?.value).toBe('all');
    expect(buildStatusFilterOptions(t)[0]?.value).toBe('all');
  });
});

describe('buildReportJobRowView', () => {
  it('resolves a completed, highlighted, expanded row and fires callbacks', () => {
    const view = buildReportJobRowView(t, job({}), rowInputs);
    expect(view.isHighlighted).toBe(true);
    expect(view.isExpanded).toBe(true);
    expect(view.downloadLabel).not.toBeNull();
    expect(view.countdown).not.toBeNull();
    view.onDownload();
    view.onRetry();
    view.onRequestAgain();
    view.onToggleExpand();
    expect(rowInputs.onDownload).toHaveBeenCalled();
  });

  it('shows progress for a running job and the failure reason for a failed one', () => {
    expect(
      buildReportJobRowView(t, job({ status: 'running', progress: 40 }), rowInputs).progressPercent,
    ).toBe(40);
    expect(
      buildReportJobRowView(
        t,
        job({ status: 'failed', failureReason: 'locked', retryCount: 1 }),
        rowInputs,
      ).failureReason,
    ).toBe('locked');
  });

  it('falls back to the raw template for a job outside the catalog', () => {
    const view = buildReportJobRowView(
      t,
      job({ template: 'bogus' as ReportJob['template'] }),
      rowInputs,
    );
    expect(view.templateLabel).toBe('bogus');
  });
});

describe('report-request-form fallbacks', () => {
  it('defaults an unknown template to CSV and reports no catalog entry', () => {
    expect(resolveDefaultFormat('bogus' as never)).toBe('csv');
    expect(findCatalogEntry('bogus' as never)).toBeNull();
  });
});

describe('buildReportsScreenView', () => {
  const query: RemoteQueryView<ReportJobsPage> = {
    data: { jobs: [job({})], total: 40, limit: 20, offset: 20 },
    isLoading: false,
    error: null,
    refetch: () => undefined,
  };
  const filters = {
    template: null,
    status: null,
    offset: 20,
    templateValue: 'all',
    statusValue: 'all',
    onTemplateChange: vi.fn(),
    onStatusChange: vi.fn(),
    onPreviousPage: vi.fn(),
    onNextPage: vi.fn(),
  };

  it('shows both pager affordances at a middle page', () => {
    const view = buildReportsScreenView(t, {
      context: { isOffline: false, isLoading: false, canRead: true },
      listQuery: query,
      jobs: [job({})],
      requestPanel: null,
      rowInputs,
      filters,
      meta: { shownCount: 1, total: 40, hasNext: true, isDegraded: true, onRefresh: vi.fn() },
      banner: 'queued',
    });
    expect(view.pagerPreviousLabel).not.toBeNull();
    expect(view.pagerNextLabel).not.toBeNull();
    expect(view.slowPollNotice).not.toBeNull();
    expect(view.rows).toHaveLength(1);
  });

  it('hides the pager on a single first page', () => {
    const view = buildReportsScreenView(t, {
      context: { isOffline: false, isLoading: false, canRead: true },
      listQuery: query,
      jobs: [],
      requestPanel: null,
      rowInputs,
      filters: { ...filters, offset: 0 },
      meta: { shownCount: 0, total: 0, hasNext: false, isDegraded: false, onRefresh: vi.fn() },
      banner: null,
    });
    expect(view.pagerPreviousLabel).toBeNull();
    expect(view.pagerNextLabel).toBeNull();
    expect(view.slowPollNotice).toBeNull();
  });
});

describe('report-request-view', () => {
  it('coerces the format value to the closed set', () => {
    expect(coerceFormat('xlsx')).toBe('xlsx');
    expect(coerceFormat('pdf')).toBe('pdf');
    expect(coerceFormat('anything')).toBe('csv');
  });

  it('builds the request panel and fires its callbacks', () => {
    const onSelectTemplate = vi.fn();
    const view = buildRequestPanelView(t, {
      template: 'team_overview',
      format: 'csv',
      season: 'all',
      seasons: [
        {
          id: 's1',
          teamId: 't',
          slug: '2026',
          name: 'Season 2026',
          startsOn: '2026-01-01',
          endsOn: '2026-12-31',
          status: 'active',
          version: 1,
        },
      ],
      isOffline: false,
      isSubmitting: false,
      validationMessage: null,
      onSelectTemplate,
      onFormatChange: vi.fn(),
      onSeasonChange: vi.fn(),
      onSubmit: vi.fn(),
    });
    expect(view.templates).toHaveLength(10);
    expect(view.seasonOptions).toHaveLength(2);
    expect(view.canSubmit).toBe(true);
    view.templates.find((template) => template.template === 'player_performance')?.onSelect();
    expect(onSelectTemplate).toHaveBeenCalledWith('player_performance');
    expect(
      view.templates.find((template) => template.template === 'player_performance')?.restrictedHint,
    ).not.toBeNull();
    view.onFormatChange('pdf');
    view.onSeasonChange('s1');
    view.onSubmit();

    const offline = buildRequestPanelView(t, {
      template: 'team_overview',
      format: 'csv',
      season: 'all',
      seasons: [],
      isOffline: true,
      isSubmitting: false,
      validationMessage: 'bad',
      onSelectTemplate,
      onFormatChange: vi.fn(),
      onSeasonChange: vi.fn(),
      onSubmit: vi.fn(),
    });
    expect(offline.canSubmit).toBe(false);
    expect(offline.offlineReason).not.toBeNull();
  });
});
