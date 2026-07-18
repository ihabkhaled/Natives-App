/**
 * App-owned dashboard domain. The backend computes every projection (rank,
 * attendance %, points, completeness); the client only presents what it is
 * given and never recalculates a score. `null` means "not evaluated" and is
 * never coerced to zero.
 */
export type DashboardPersona = 'member' | 'coach' | 'administrator';

export type DashboardWidgetTone = 'positive' | 'neutral' | 'attention' | 'critical';

export type DashboardWidgetStatus = 'ready' | 'empty' | 'partial' | 'unavailable';

type DashboardMetricUnit = 'percent' | 'points' | 'rank';

export interface DashboardMetric {
  /** Raw projected value, or null when not enough data exists (never zero). */
  readonly value: number | null;
  /** Backend-rounded display string; null mirrors a null value. */
  readonly displayValue: string | null;
  readonly unit: DashboardMetricUnit | null;
  readonly tone: DashboardWidgetTone;
}

export interface DashboardBreakdownRow {
  readonly key: string;
  /** i18n key for the row label; raw backend copy is never rendered. */
  readonly labelKey: string;
  readonly value: number | null;
  readonly displayValue: string | null;
}

export interface DashboardTask {
  readonly id: string;
  /** i18n key for the task label; raw backend copy is never rendered. */
  readonly labelKey: string;
  readonly count: number | null;
  readonly tone: DashboardWidgetTone;
  /** UTC instant (ISO 8601) the task refers to, or null. */
  readonly occurredAtIso: string | null;
}

interface DashboardWidgetShared {
  readonly kind: string;
  readonly status: DashboardWidgetStatus;
  /** Per-widget freshness instant (UTC ISO 8601), or null when unknown. */
  readonly asOfIso: string | null;
}

interface DashboardMetricWidget extends DashboardWidgetShared {
  readonly presentation: 'metric';
  readonly metric: DashboardMetric;
}

interface DashboardBreakdownWidget extends DashboardWidgetShared {
  readonly presentation: 'breakdown';
  readonly rows: readonly DashboardBreakdownRow[];
}

interface DashboardTasksWidget extends DashboardWidgetShared {
  readonly presentation: 'tasks';
  readonly tasks: readonly DashboardTask[];
}

export type DashboardWidget =
  DashboardMetricWidget | DashboardBreakdownWidget | DashboardTasksWidget;

export interface DashboardSummary {
  readonly persona: DashboardPersona;
  /** When the projection was generated (UTC ISO 8601). */
  readonly generatedAtIso: string;
  readonly widgets: readonly DashboardWidget[];
}
