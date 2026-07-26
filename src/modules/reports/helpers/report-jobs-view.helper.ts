import { formatDate } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  REPORT_STATUSES,
  REPORTS_FILTER_ALL,
  TEMPLATE_CATALOG,
  type ReportStatus,
} from '../constants/reports.constants';
import { checksumTail } from './report-download.helper';
import {
  buildReportRowActions,
  buildReportStatusChip,
  formatExpiryCountdown,
} from './report-status-view.helper';
import { findCatalogEntry } from './report-request-form.helper';
import type { ReportJob } from '../types/reports.types';
import type { ReportJobFact, ReportJobRowView } from '../types/reports-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** Resolved per-row state and callbacks the row view binds. */
export interface ReportRowInputs {
  readonly nowMs: number;
  readonly locale: string;
  readonly highlightedId: string;
  readonly expandedId: string;
  readonly downloadingId: string;
  readonly actionsAllowed: boolean;
  readonly canGenerate: boolean;
  readonly onDownload: (job: ReportJob) => void;
  readonly onRetry: (job: ReportJob) => void;
  readonly onRequestAgain: (job: ReportJob) => void;
  readonly onToggleExpand: (job: ReportJob) => void;
}

function buildFacts(t: Translate, job: ReportJob): readonly ReportJobFact[] {
  return [
    { key: 'job-id', label: t(I18N_KEYS.reports.detailJobId), value: job.jobId },
    {
      key: 'calculation-version',
      label: t(I18N_KEYS.reports.detailCalculationVersion),
      value: job.calculationVersion,
    },
    {
      key: 'checksum',
      label: t(I18N_KEYS.reports.detailChecksum),
      value:
        job.checksum === null
          ? t(I18N_KEYS.reports.detailChecksumMissing)
          : checksumTail(job.checksum),
    },
    {
      key: 'season',
      label: t(I18N_KEYS.reports.detailSeason),
      value: job.seasonId ?? t(I18N_KEYS.reports.seasonAll),
    },
    { key: 'privacy', label: t(I18N_KEYS.reports.detailPrivacy), value: job.privacyClass },
  ];
}

type RowActions = ReturnType<typeof buildReportRowActions>;

/** The status/progress/countdown facts of one row. */
function buildRowStatus(t: Translate, job: ReportJob, actions: RowActions, nowMs: number) {
  const isCompleted = job.status === 'completed';
  return {
    statusChip: buildReportStatusChip(t, job.status),
    progressPercent: actions.showProgress ? job.progress : null,
    progressLabel: actions.showProgress
      ? t(I18N_KEYS.reports.progressLabel, { percent: String(job.progress) })
      : null,
    completedSummary:
      isCompleted && job.rowCount !== null
        ? t(I18N_KEYS.reports.rowCountLabel, { rows: String(job.rowCount) })
        : null,
    countdown: isCompleted ? formatExpiryCountdown(t, job.expiresAtIso, nowMs) : null,
    failureReason: job.failureReason,
  };
}

/** The per-status action labels/handlers of one row. */
function buildRowActionLabels(
  t: Translate,
  job: ReportJob,
  actions: RowActions,
  inputs: ReportRowInputs,
) {
  return {
    downloadLabel:
      actions.showDownload && inputs.actionsAllowed ? t(I18N_KEYS.reports.download) : null,
    isDownloading: inputs.downloadingId === job.jobId,
    onDownload: () => {
      inputs.onDownload(job);
    },
    retryLabel: actions.showRetry && inputs.actionsAllowed ? actions.retryLabel : null,
    onRetry: () => {
      inputs.onRetry(job);
    },
    requestAgainLabel:
      actions.showRequestAgain && inputs.canGenerate ? actions.requestAgainLabel : null,
    onRequestAgain: () => {
      inputs.onRequestAgain(job);
    },
    expandLabel: t(
      inputs.expandedId === job.jobId ? I18N_KEYS.reports.collapseRow : I18N_KEYS.reports.expandRow,
    ),
    isExpanded: inputs.expandedId === job.jobId,
    onToggleExpand: () => {
      inputs.onToggleExpand(job);
    },
  };
}

/** One rendered job row with its per-status affordances resolved. */
export function buildReportJobRowView(
  t: Translate,
  job: ReportJob,
  inputs: ReportRowInputs,
): ReportJobRowView {
  const actions = buildReportRowActions(t, job);
  const catalogEntry = findCatalogEntry(job.template);
  return {
    key: job.jobId,
    templateLabel: catalogEntry === null ? job.template : t(catalogEntry.labelKey),
    formatBadge: job.format.toUpperCase(),
    requestedAt: t(I18N_KEYS.reports.requestedAt, {
      date: formatDate(job.createdAtIso, inputs.locale),
    }),
    isHighlighted: job.jobId === inputs.highlightedId,
    ...buildRowStatus(t, job, actions, inputs.nowMs),
    ...buildRowActionLabels(t, job, actions, inputs),
    facts: buildFacts(t, job),
  };
}

/** The template facet options, "All" first. */
export function buildTemplateFilterOptions(t: Translate) {
  return [
    { value: REPORTS_FILTER_ALL, label: t(I18N_KEYS.reports.filterAll) },
    ...TEMPLATE_CATALOG.map((entry) => ({ value: entry.template, label: t(entry.labelKey) })),
  ];
}

/** The status facet options, "All" first. */
export function buildStatusFilterOptions(t: Translate) {
  return [
    { value: REPORTS_FILTER_ALL, label: t(I18N_KEYS.reports.filterAll) },
    ...REPORT_STATUSES.map((value: ReportStatus) => ({
      value,
      label: buildReportStatusChip(t, value).label,
    })),
  ];
}
