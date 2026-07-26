import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import type { ReportJobRowView } from '../types/reports-view.types';
import { ReportJobList } from './report-job-list';
import { ReportJobRow } from './report-job-row';
import { ReportRequestPanel } from './report-request-panel';
import { ReportStatusChip } from './report-status-chip';

const noop = vi.fn();

function row(overrides: Partial<ReportJobRowView>): ReportJobRowView {
  return {
    key: 'j1',
    templateLabel: 'Attendance',
    formatBadge: 'CSV',
    statusChip: { label: 'Completed', tone: 'success' },
    requestedAt: 'today',
    isHighlighted: false,
    progressPercent: null,
    progressLabel: null,
    completedSummary: null,
    countdown: null,
    failureReason: null,
    downloadLabel: null,
    isDownloading: false,
    onDownload: noop,
    retryLabel: null,
    onRetry: noop,
    requestAgainLabel: null,
    onRequestAgain: noop,
    expandLabel: 'Show details',
    isExpanded: false,
    onToggleExpand: noop,
    facts: [{ key: 'id', label: 'Job ID', value: 'j1' }],
    ...overrides,
  };
}

describe('reports components (both branches)', () => {
  it('renders a running row with progress, then a completed downloadable + expanded row', () => {
    const view = render(
      <ReportJobRow
        row={row({
          isHighlighted: true,
          progressPercent: 40,
          progressLabel: '40% complete',
          statusChip: { label: 'Running', tone: 'warning' },
        })}
      />,
    );
    expect(view.container).toBeInTheDocument();
    render(
      <ReportJobRow
        row={row({
          completedSummary: '12 rows',
          countdown: 'available 6 d',
          failureReason: 'locked',
          downloadLabel: 'Download',
          retryLabel: 'Retry (2 left)',
          requestAgainLabel: 'Request again',
          isExpanded: true,
        })}
      />,
    );
    // A progress bar with no textual label — the `?? ''` fallback.
    render(<ReportJobRow row={row({ progressPercent: 10, progressLabel: null })} />);
  });

  it('renders the live status chip variant', () => {
    const view = render(<ReportStatusChip label="Running" tone="warning" isAnimated={true} />);
    render(<ReportStatusChip label="Completed" tone="success" isAnimated={false} />);
    expect(view.container).toBeInTheDocument();
  });

  it('renders the job list with a slow-poll notice and both pager buttons', () => {
    const view = {
      listHeading: 'Report jobs',
      templateFilterLabel: 'Template',
      templateFilterValue: 'all',
      templateFilterOptions: [{ value: 'all', label: 'All' }],
      onTemplateFilterChange: noop,
      statusFilterLabel: 'Status',
      statusFilterValue: 'all',
      statusFilterOptions: [{ value: 'all', label: 'All' }],
      onStatusFilterChange: noop,
      countLabel: '1 of 40',
      refreshLabel: 'Refresh',
      onRefresh: noop,
      slowPollNotice: 'still running',
      pagerPreviousLabel: 'Previous',
      onPreviousPage: noop,
      pagerNextLabel: 'Next',
      onNextPage: noop,
      rows: [row({})],
    } as never;
    render(<ReportJobList view={view} />);
    expect(screen.getByTestId(TEST_IDS.reportJobList)).toBeInTheDocument();

    const noPager = {
      ...(view as object),
      slowPollNotice: null,
      pagerPreviousLabel: null,
      pagerNextLabel: null,
      rows: [],
    } as never;
    render(<ReportJobList view={noPager} />);
  });

  it('renders the request panel with a restricted template and a validation error', () => {
    const view = {
      heading: 'Request a report',
      intro: 'intro',
      templateLabel: 'Template',
      templates: [
        {
          template: 'analysis',
          label: 'Analysis',
          hint: 'deep',
          privacyLabel: 'Restricted',
          privacyTone: 'warning',
          restrictedHint: 'restricted',
          isSelected: true,
          onSelect: noop,
        },
        {
          template: 'team_overview',
          label: 'Team overview',
          hint: 'snapshot',
          privacyLabel: 'Team',
          privacyTone: 'medium',
          restrictedHint: null,
          isSelected: false,
          onSelect: noop,
        },
      ],
      formatLabel: 'Format',
      formatValue: 'pdf',
      formatOptions: [{ value: 'pdf', label: 'PDF' }],
      onFormatChange: noop,
      seasonLabel: 'Season',
      seasonValue: 'all',
      seasonOptions: [{ value: 'all', label: 'All' }],
      onSeasonChange: noop,
      submitLabel: 'Request',
      canSubmit: true,
      isSubmitting: false,
      onSubmit: noop,
      validationMessage: 'That combination is not valid',
      offlineReason: 'offline',
    };
    const utils = render(<ReportRequestPanel view={view} />);
    expect(utils.container).toBeInTheDocument();
  });
});
