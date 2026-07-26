import type { AsyncViewStatus, SelectFieldOption } from '@/shared/ui';
import type { ScreenCopy } from '@/shared/view';

import type { ReportStatus, ReportTemplate } from '../constants/reports.constants';

/** The facet + pager state of the reports list. */
export interface ReportFiltersView {
  readonly template: ReportTemplate | null;
  readonly status: ReportStatus | null;
  readonly offset: number;
  readonly templateValue: string;
  readonly statusValue: string;
  readonly onTemplateChange: (value: string) => void;
  readonly onStatusChange: (value: string) => void;
  readonly onPreviousPage: () => void;
  readonly onNextPage: () => void;
}

/** One template radio card of the request panel. */
interface TemplateCardView {
  readonly template: string;
  readonly label: string;
  readonly hint: string;
  readonly privacyLabel: string;
  readonly privacyTone: string;
  readonly restrictedHint: string | null;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}

/** The request panel, present only for report.generate holders. */
export interface ReportRequestPanelView {
  readonly heading: string;
  readonly intro: string;
  readonly templateLabel: string;
  readonly templates: readonly TemplateCardView[];
  readonly formatLabel: string;
  readonly formatValue: string;
  readonly formatOptions: readonly SelectFieldOption[];
  readonly onFormatChange: (value: string) => void;
  readonly seasonLabel: string;
  readonly seasonValue: string;
  readonly seasonOptions: readonly SelectFieldOption[];
  readonly onSeasonChange: (value: string) => void;
  readonly submitLabel: string;
  readonly canSubmit: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: () => void;
  readonly validationMessage: string | null;
  readonly offlineReason: string | null;
}

/** One fact of the expandable job region. */
export interface ReportJobFact {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

/** One rendered job row with its per-status affordances. */
export interface ReportJobRowView {
  readonly key: string;
  readonly templateLabel: string;
  readonly formatBadge: string;
  readonly statusChip: { readonly label: string; readonly tone: string };
  readonly requestedAt: string;
  readonly isHighlighted: boolean;
  readonly progressPercent: number | null;
  readonly progressLabel: string | null;
  readonly completedSummary: string | null;
  readonly countdown: string | null;
  readonly failureReason: string | null;
  readonly downloadLabel: string | null;
  readonly isDownloading: boolean;
  readonly onDownload: () => void;
  readonly retryLabel: string | null;
  readonly onRetry: () => void;
  readonly requestAgainLabel: string | null;
  readonly onRequestAgain: () => void;
  readonly expandLabel: string;
  readonly isExpanded: boolean;
  readonly onToggleExpand: () => void;
  readonly facts: readonly ReportJobFact[];
}

/** The whole reports center, ready to render. */
export interface ReportsScreenView extends ScreenCopy {
  readonly status: AsyncViewStatus;
  readonly title: string;
  readonly subtitle: string;
  readonly requestPanel: ReportRequestPanelView | null;
  readonly listHeading: string;
  readonly templateFilterLabel: string;
  readonly templateFilterValue: string;
  readonly templateFilterOptions: readonly SelectFieldOption[];
  readonly onTemplateFilterChange: (value: string) => void;
  readonly statusFilterLabel: string;
  readonly statusFilterValue: string;
  readonly statusFilterOptions: readonly SelectFieldOption[];
  readonly onStatusFilterChange: (value: string) => void;
  readonly rows: readonly ReportJobRowView[];
  readonly countLabel: string;
  readonly refreshLabel: string;
  readonly onRefresh: () => void;
  readonly slowPollNotice: string | null;
  readonly pagerPreviousLabel: string | null;
  readonly onPreviousPage: () => void;
  readonly pagerNextLabel: string | null;
  readonly onNextPage: () => void;
  readonly banner: string | null;
}
