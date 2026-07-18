import type { AsyncViewCopy } from '@/shared/types';

/**
 * Prepared, fully-translated view models handed to the presentational
 * dashboard components. Every label is resolved and every instant formatted
 * here so the components stay UI-only.
 */
export type DashboardStatus = 'loading' | 'error' | 'offline' | 'empty' | 'ready';

export interface DashboardMetricView {
  readonly valueText: string;
  /** false when the projection was null; the tile renders muted. */
  readonly hasValue: boolean;
  readonly unitLabel: string | null;
  readonly color: string;
}

export interface DashboardBreakdownRowView {
  readonly key: string;
  readonly label: string;
  readonly valueText: string;
  readonly hasValue: boolean;
}

export interface DashboardTaskView {
  readonly id: string;
  readonly label: string;
  readonly countText: string | null;
  readonly color: string;
  readonly timeText: string | null;
}

interface DashboardWidgetViewShared {
  readonly kind: string;
  readonly testId: string;
  readonly title: string;
  readonly freshnessLabel: string | null;
  /** ready|partial content is shown; empty|unavailable shows the state note. */
  readonly showsContent: boolean;
  readonly stateLabel: string;
  readonly partialLabel: string | null;
}

export interface DashboardMetricWidgetView extends DashboardWidgetViewShared {
  readonly presentation: 'metric';
  readonly metric: DashboardMetricView;
}

export interface DashboardBreakdownWidgetView extends DashboardWidgetViewShared {
  readonly presentation: 'breakdown';
  readonly caption: string;
  readonly rows: readonly DashboardBreakdownRowView[];
}

export interface DashboardTasksWidgetView extends DashboardWidgetViewShared {
  readonly presentation: 'tasks';
  readonly emptyTasksLabel: string;
  readonly tasks: readonly DashboardTaskView[];
}

export type DashboardWidgetView =
  DashboardMetricWidgetView | DashboardBreakdownWidgetView | DashboardTasksWidgetView;

export interface DashboardView extends AsyncViewCopy {
  readonly title: string;
  readonly updatedLabel: string | null;
  readonly status: DashboardStatus;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly widgets: readonly DashboardWidgetView[];
}
