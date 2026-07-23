import { formatDateTime } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { TEST_IDS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';
import { hasAllPermissions } from '@/shared/security';

import {
  DASHBOARD_WIDGET_REGISTRY,
  type DashboardWidgetDescriptor,
} from '../constants/dashboard-widgets.constants';
import type {
  DashboardBreakdownRowView,
  DashboardMetricView,
  DashboardStatus,
  DashboardTaskView,
  DashboardWidgetLinkView,
  DashboardWidgetStateKind,
  DashboardWidgetView,
} from '../types/dashboard-view.types';
import type {
  DashboardBreakdownRow,
  DashboardMetric,
  DashboardTask,
  DashboardWidget,
  DashboardWidgetStatus,
} from '../types/dashboard.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** Map a semantic tone to an Ionic colour used for badges and emphasis. */
function toneColor(tone: DashboardMetric['tone']): string {
  if (tone === 'positive') {
    return 'success';
  }
  if (tone === 'attention') {
    return 'warning';
  }
  if (tone === 'critical') {
    return 'danger';
  }
  return 'medium';
}

function buildUnitLabel(t: Translate, unit: DashboardMetric['unit']): string | null {
  if (unit === 'percent') {
    return t(I18N_KEYS.dashboard.unitPercent);
  }
  if (unit === 'points') {
    return t(I18N_KEYS.dashboard.unitPoints);
  }
  if (unit === 'rank') {
    return t(I18N_KEYS.dashboard.unitRank);
  }
  return null;
}

function buildMetricView(t: Translate, metric: DashboardMetric): DashboardMetricView {
  const displayValue = metric.value === null ? null : metric.displayValue;
  return {
    valueText: displayValue ?? t(I18N_KEYS.dashboard.notEnoughData),
    hasValue: displayValue !== null,
    unitLabel: buildUnitLabel(t, metric.unit),
    color: toneColor(metric.tone),
  };
}

function buildBreakdownRowView(
  t: Translate,
  row: DashboardBreakdownRow,
): DashboardBreakdownRowView {
  const missing = row.value === null || row.displayValue === null;
  return {
    key: row.key,
    label: t(row.labelKey),
    valueText: missing ? t(I18N_KEYS.dashboard.noValue) : row.displayValue,
    hasValue: !missing,
  };
}

function buildTaskView(t: Translate, locale: string, task: DashboardTask): DashboardTaskView {
  return {
    id: task.id,
    label: t(task.labelKey),
    countText: task.count === null ? null : `${task.count}`,
    color: toneColor(task.tone),
    timeText: task.occurredAtIso === null ? null : formatDateTime(task.occurredAtIso, locale),
  };
}

function buildFreshnessLabel(t: Translate, locale: string, asOfIso: string | null): string | null {
  return asOfIso === null
    ? null
    : t(I18N_KEYS.dashboard.asOf, { when: formatDateTime(asOfIso, locale) });
}

function buildStateKind(status: DashboardWidgetStatus): DashboardWidgetStateKind | null {
  if (status === 'empty') {
    return 'empty';
  }
  return status === 'unavailable' ? 'unavailable' : null;
}

function buildStateLabel(t: Translate, kind: DashboardWidgetStateKind | null): string {
  if (kind === 'empty') {
    return t(I18N_KEYS.dashboard.widgetEmpty);
  }
  return kind === 'unavailable' ? t(I18N_KEYS.dashboard.widgetUnavailable) : '';
}

/** Only a failed section earns a supporting line; an empty one stays quiet. */
function buildStateMessage(t: Translate, kind: DashboardWidgetStateKind | null): string | null {
  return kind === 'unavailable' ? t(I18N_KEYS.dashboard.widgetUnavailableMessage) : null;
}

/**
 * Resolve the footer deep link. It renders only when the viewer holds the
 * TARGET route's permission — a link that lands on "no access" is worse than
 * no link at all.
 */
function buildLinkView(
  t: Translate,
  descriptor: DashboardWidgetDescriptor,
  permissions: readonly string[],
): DashboardWidgetLinkView | null {
  const link = descriptor.link;
  if (link === null || !hasAllPermissions(permissions, [link.linkPermission])) {
    return null;
  }
  return { path: link.linkPath, label: t(link.linkLabelKey) };
}

/** Everything widget preparation reads besides the widget itself. */
interface WidgetBuildContext {
  readonly t: Translate;
  readonly locale: string;
  readonly permissions: readonly string[];
}

function buildSharedView(
  context: WidgetBuildContext,
  widget: DashboardWidget,
  descriptor: DashboardWidgetDescriptor,
) {
  const { t, locale, permissions } = context;
  const stateKind = buildStateKind(widget.status);
  return {
    kind: widget.kind,
    testId: `${TEST_IDS.dashboardWidget}-${widget.kind}`,
    title: t(descriptor.titleKey),
    freshnessLabel: buildFreshnessLabel(t, locale, widget.asOfIso),
    showsContent: widget.status === 'ready' || widget.status === 'partial',
    stateKind,
    stateLabel: buildStateLabel(t, stateKind),
    stateMessage: buildStateMessage(t, stateKind),
    partialLabel: widget.status === 'partial' ? t(I18N_KEYS.dashboard.widgetPartial) : null,
    link: buildLinkView(t, descriptor, permissions),
  };
}

function buildWidgetView(
  context: WidgetBuildContext,
  widget: DashboardWidget,
  descriptor: DashboardWidgetDescriptor,
): DashboardWidgetView {
  const { t, locale } = context;
  const shared = buildSharedView(context, widget, descriptor);
  if (widget.presentation === 'metric') {
    return { ...shared, presentation: 'metric', metric: buildMetricView(t, widget.metric) };
  }
  if (widget.presentation === 'breakdown') {
    return {
      ...shared,
      presentation: 'breakdown',
      caption: shared.title,
      rows: widget.rows.map((row) => buildBreakdownRowView(t, row)),
    };
  }
  return {
    ...shared,
    presentation: 'tasks',
    emptyTasksLabel: t(I18N_KEYS.dashboard.widgetEmpty),
    tasks: widget.tasks.map((task) => buildTaskView(t, locale, task)),
  };
}

function isWidgetPermitted(
  descriptor: DashboardWidgetDescriptor,
  permissions: readonly string[],
): boolean {
  return descriptor.permission === null || hasAllPermissions(permissions, [descriptor.permission]);
}

/**
 * Filter the summary's widgets to those the effective session may see, then
 * prepare each translated view. Unknown kinds and permission-gated widgets the
 * principal lacks are dropped — the backend re-authorizes regardless.
 */
export function buildDashboardWidgetViews(
  widgets: readonly DashboardWidget[],
  permissions: readonly string[],
  t: Translate,
  locale: string,
): readonly DashboardWidgetView[] {
  return widgets.flatMap((widget) => {
    const descriptor = DASHBOARD_WIDGET_REGISTRY[widget.kind];
    if (descriptor === undefined || !isWidgetPermitted(descriptor, permissions)) {
      return [];
    }
    return [buildWidgetView({ t, locale, permissions }, widget, descriptor)];
  });
}

/** Pure state machine deciding which single dashboard state to present. */
export function resolveDashboardStatus(params: {
  readonly hasSummary: boolean;
  readonly hasWidgets: boolean;
  readonly isLoading: boolean;
  readonly hasError: boolean;
  readonly isOffline: boolean;
}): DashboardStatus {
  if (params.hasSummary) {
    return params.hasWidgets ? 'ready' : 'empty';
  }
  if (params.isOffline) {
    return 'offline';
  }
  if (params.isLoading) {
    return 'loading';
  }
  if (params.hasError) {
    return 'error';
  }
  return 'empty';
}
