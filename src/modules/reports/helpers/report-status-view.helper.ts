import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { REPORTS_LIMITS, type ReportStatus } from '../constants/reports.constants';
import type { ReportJob } from '../types/reports.types';

type Translate = (key: string, params?: TranslateParams) => string;

const STATUS_VIEWS: Readonly<
  Record<ReportStatus, { readonly key: string; readonly tone: string }>
> = {
  queued: { key: I18N_KEYS.reports.statusQueued, tone: 'medium' },
  running: { key: I18N_KEYS.reports.statusRunning, tone: 'warning' },
  completed: { key: I18N_KEYS.reports.statusCompleted, tone: 'success' },
  failed: { key: I18N_KEYS.reports.statusFailed, tone: 'danger' },
  expired: { key: I18N_KEYS.reports.statusExpired, tone: 'medium' },
};

/** The status chip of one job. */
export function buildReportStatusChip(
  t: Translate,
  status: ReportStatus,
): { readonly label: string; readonly tone: string } {
  const view = STATUS_VIEWS[status];
  return { label: t(view.key), tone: view.tone };
}

const MS_PER_HOUR = 3_600_000;
const HOURS_PER_DAY = 24;

/** "available 6 d 4 h" — the completed row's download window countdown. */
export function formatExpiryCountdown(t: Translate, expiresAtIso: string, nowMs: number): string {
  const remainingMs = Date.parse(expiresAtIso) - nowMs;
  if (remainingMs <= 0) {
    return t(I18N_KEYS.reports.expiredNotice);
  }
  const totalHours = Math.floor(remainingMs / MS_PER_HOUR);
  const days = Math.floor(totalHours / HOURS_PER_DAY);
  const hours = totalHours % HOURS_PER_DAY;
  return t(I18N_KEYS.reports.expiresIn, { days: String(days), hours: String(hours) });
}

/** The per-status affordances of one row. */
export interface ReportRowActions {
  readonly showProgress: boolean;
  readonly showDownload: boolean;
  readonly showRetry: boolean;
  readonly retryLabel: string | null;
  readonly showRequestAgain: boolean;
  readonly requestAgainLabel: string | null;
}

/**
 * The action table per status + retry budget: running shows the live
 * progress; completed offers Download until the window closes; failed offers
 * Retry while attempts remain, then "Request again"; expired offers
 * "Generate again". Nothing here changes a status — the server owns the
 * state machine.
 */
export function buildReportRowActions(t: Translate, job: ReportJob): ReportRowActions {
  const retriesLeft = REPORTS_LIMITS.maxRetries - job.retryCount;
  const canRetry = job.status === 'failed' && retriesLeft > 0;
  const requestAgain = (job.status === 'failed' && retriesLeft <= 0) || job.status === 'expired';
  return {
    showProgress: job.status === 'running',
    showDownload: job.status === 'completed',
    showRetry: canRetry,
    retryLabel: canRetry
      ? t(I18N_KEYS.reports.retryRemaining, { count: String(retriesLeft) })
      : null,
    showRequestAgain: requestAgain,
    requestAgainLabel: requestAgain
      ? t(
          job.status === 'expired'
            ? I18N_KEYS.reports.generateAgain
            : I18N_KEYS.reports.requestAgain,
        )
      : null,
  };
}
