import type { TranslateParams } from '@/packages/i18n';
import type { RemoteQueryView } from '@/shared/view';
import { resolveScreenStatus } from '@/shared/view';
import { I18N_KEYS } from '@/shared/i18n';

import {
  buildReportJobRowView,
  buildStatusFilterOptions,
  buildTemplateFilterOptions,
  type ReportRowInputs,
} from './report-jobs-view.helper';
import { buildReportsScreenCopy } from './reports-copy.helper';
import type { ReportJob, ReportJobsPage } from '../types/reports.types';
import type {
  ReportFiltersView,
  ReportRequestPanelView,
  ReportsScreenView,
} from '../types/reports-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** The counts + poll notice the list chrome shows. */
interface ReportsListMeta {
  readonly shownCount: number;
  readonly total: number;
  readonly hasNext: boolean;
  readonly isDegraded: boolean;
  readonly onRefresh: () => void;
}

function buildReportsListChrome(t: Translate, filters: ReportFiltersView, meta: ReportsListMeta) {
  return {
    listHeading: t(I18N_KEYS.reports.listHeading),
    templateFilterLabel: t(I18N_KEYS.reports.filterTemplateLabel),
    templateFilterValue: filters.templateValue,
    templateFilterOptions: buildTemplateFilterOptions(t),
    onTemplateFilterChange: filters.onTemplateChange,
    statusFilterLabel: t(I18N_KEYS.reports.filterStatusLabel),
    statusFilterValue: filters.statusValue,
    statusFilterOptions: buildStatusFilterOptions(t),
    onStatusFilterChange: filters.onStatusChange,
    countLabel: t(I18N_KEYS.reports.resultCount, {
      shown: String(meta.shownCount),
      total: String(meta.total),
    }),
    refreshLabel: t(I18N_KEYS.reports.refresh),
    onRefresh: meta.onRefresh,
    slowPollNotice: meta.isDegraded ? t(I18N_KEYS.reports.slowPollNotice) : null,
    pagerPreviousLabel: filters.offset > 0 ? t(I18N_KEYS.reports.pagerPrevious) : null,
    onPreviousPage: filters.onPreviousPage,
    pagerNextLabel: meta.hasNext ? t(I18N_KEYS.reports.pagerNext) : null,
    onNextPage: filters.onNextPage,
  };
}

/** Everything the reports center needs, assembled once. */
export interface ReportsScreenDeps {
  readonly context: {
    readonly isOffline: boolean;
    readonly isLoading: boolean;
    readonly canRead: boolean;
  };
  readonly listQuery: RemoteQueryView<ReportJobsPage>;
  readonly jobs: readonly ReportJob[];
  readonly requestPanel: ReportRequestPanelView | null;
  readonly rowInputs: ReportRowInputs;
  readonly filters: ReportFiltersView;
  readonly meta: ReportsListMeta;
  readonly banner: string | null;
}

export function buildReportsScreenView(t: Translate, deps: ReportsScreenDeps): ReportsScreenView {
  return {
    ...buildReportsScreenCopy(t, {
      error: deps.listQuery.error,
      isOffline: deps.context.isOffline,
      onRetry: deps.listQuery.refetch,
    }),
    status: resolveScreenStatus(
      deps.context,
      deps.listQuery,
      deps.context.canRead,
      deps.jobs.length > 0,
    ),
    title: t(I18N_KEYS.reports.title),
    subtitle: t(I18N_KEYS.reports.subtitle),
    requestPanel: deps.requestPanel,
    ...buildReportsListChrome(t, deps.filters, deps.meta),
    rows: deps.jobs.map((job) => buildReportJobRowView(t, job, deps.rowInputs)),
    banner: deps.banner,
  };
}
