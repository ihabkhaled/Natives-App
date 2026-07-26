import { useState } from 'react';

import { nowIso } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView } from '@/shared/view';

import { buildReportsScreenView } from '../helpers/reports-screen-view.helper';
import { isPollDegraded, nextActiveSince, resolveJobsPage } from '../helpers/reports-poll.helper';
import { buildReportJobsQueryOptions } from '../queries/reports.query';
import type { ReportJobsPage } from '../types/reports.types';
import type { ReportsScreenView } from '../types/reports-view.types';
import { useReportActions } from './use-report-actions.hook';
import { useReportDownload } from './use-report-download.hook';
import { useReportFilters } from './use-report-filters.hook';
import { useReportsContext } from './use-reports-context.hook';

/**
 * View model of the reports center: the polled job list (function-form
 * refetchInterval — 4 s active, 15 s degraded, paused offline/hidden), plus
 * the request, download, filter, and action concerns delegated to sub-hooks.
 */
export function useReportJobs(): ReportsScreenView {
  const { t, locale } = useAppTranslation();
  const context = useReportsContext();
  const nowMs = Date.parse(nowIso());
  const filters = useReportFilters();

  const [expandedId, setExpandedId] = useState('');
  const [activeSinceMs, setActiveSinceMs] = useState<number | null>(null);

  const listQuery = toRemoteQueryView<ReportJobsPage>(
    useAppQuery(
      buildReportJobsQueryOptions(
        context.teamId,
        { template: filters.template, status: filters.status },
        filters.offset,
        { activeSinceMs, isOffline: context.isOffline },
      ),
    ),
  );
  const { jobs, total } = resolveJobsPage(listQuery.data);
  const hasData = listQuery.data !== undefined;
  const computedActiveSince = nextActiveSince(jobs, activeSinceMs, nowMs);
  if (computedActiveSince !== activeSinceMs) {
    setActiveSinceMs(computedActiveSince);
  }

  const download = useReportDownload(t, context.teamId, listQuery.refetch);
  const actions = useReportActions(t, { context, jobs, onRefetch: listQuery.refetch });

  return buildReportsScreenView(t, {
    context,
    listQuery,
    jobs,
    requestPanel: actions.requestPanel,
    rowInputs: {
      nowMs,
      locale,
      highlightedId: actions.highlightedId,
      expandedId,
      downloadingId: download.downloadingId,
      actionsAllowed: context.canGenerate && !context.isOffline,
      canGenerate: context.canGenerate,
      onDownload: download.download,
      onRetry: actions.onRetry,
      onRequestAgain: actions.onRequestAgain,
      onToggleExpand: (target) => {
        setExpandedId((current) => (current === target.jobId ? '' : target.jobId));
      },
    },
    filters,
    meta: {
      shownCount: jobs.length,
      total,
      hasNext: hasData && filters.offset + jobs.length < total,
      isDegraded: isPollDegraded(jobs, computedActiveSince, nowMs, context.isOffline),
      onRefresh: listQuery.refetch,
    },
    banner: actions.banner,
  });
}
