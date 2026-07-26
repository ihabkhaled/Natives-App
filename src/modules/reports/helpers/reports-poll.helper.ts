import { REPORTS_POLL } from '../constants/reports.constants';
import type { ReportJob, ReportJobsPage } from '../types/reports.types';

/** Whether any visible job is still moving through the state machine. */
export function hasActiveJob(jobs: readonly ReportJob[]): boolean {
  return jobs.some((job) => job.status === 'queued' || job.status === 'running');
}

/** The jobs and total of a page, defaulting to empty before the first load. */
export function resolveJobsPage(page: ReportJobsPage | undefined): {
  readonly jobs: readonly ReportJob[];
  readonly total: number;
} {
  return { jobs: page?.jobs ?? [], total: page?.total ?? 0 };
}

/**
 * Pure poll decision — the function-form `refetchInterval` the list query
 * uses. 4 s while any visible job is queued/running; degraded to 15 s once
 * the same activity has been polling for 5 continuous minutes (the screen
 * then shows "still running — safe to leave"); `false` (no polling at all)
 * when idle or offline. Background polling is disabled at the query level, so
 * a hidden tab never polls.
 */
export function resolvePollInterval(
  jobs: readonly ReportJob[],
  activeSinceMs: number | null,
  nowMs: number,
  isOffline: boolean,
): number | false {
  if (isOffline || !hasActiveJob(jobs)) {
    return false;
  }
  if (activeSinceMs !== null && nowMs - activeSinceMs >= REPORTS_POLL.slowAfterMs) {
    return REPORTS_POLL.slowMs;
  }
  return REPORTS_POLL.activeMs;
}

/**
 * Track when continuous activity began: set on the first active poll, kept
 * while activity continues, and cleared the moment every job is terminal.
 */
export function nextActiveSince(
  jobs: readonly ReportJob[],
  activeSinceMs: number | null,
  nowMs: number,
): number | null {
  if (!hasActiveJob(jobs)) {
    return null;
  }
  return activeSinceMs ?? nowMs;
}

/**
 * Whether polling has run long enough (5 min) on continuous activity to
 * degrade to the slow interval and show the "safe to leave" note.
 */
export function isPollDegraded(
  jobs: readonly ReportJob[],
  activeSinceMs: number | null,
  nowMs: number,
  isOffline: boolean,
): boolean {
  return (
    !isOffline &&
    activeSinceMs !== null &&
    nowMs - activeSinceMs >= REPORTS_POLL.slowAfterMs &&
    hasActiveJob(jobs)
  );
}
