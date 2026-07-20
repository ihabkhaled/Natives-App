import type { SchemaOutput } from '@/packages/schema';

import type { dashboardSummaryResponseSchema } from '../schemas/dashboard-summary.schema';
import type { DashboardSummary, DashboardTask, DashboardWidget } from '../types/dashboard.types';

type SummaryDto = SchemaOutput<typeof dashboardSummaryResponseSchema>;
type WidgetDto = SummaryDto['widgets'][number];
type TaskDto = NonNullable<Extract<WidgetDto, { presentation: 'tasks' }>['tasks']>[number];
type MetricDto = NonNullable<Extract<WidgetDto, { presentation: 'metric' }>['metric']>;

/**
 * A widget that carries no metric is "not evaluated", not "zero". The absent
 * projection maps to an explicitly-null metric so the view renders its muted
 * no-data treatment instead of a fabricated number.
 */
const UNEVALUATED_METRIC: MetricDto = {
  value: null,
  displayValue: null,
  unit: null,
  tone: 'neutral',
};

function mapTask(dto: TaskDto): DashboardTask {
  return {
    id: dto.id,
    labelKey: dto.labelKey,
    count: dto.count,
    tone: dto.tone,
    occurredAtIso: dto.occurredAt,
  };
}

function mapWidget(dto: WidgetDto): DashboardWidget {
  const shared = { kind: dto.kind, status: dto.status, asOfIso: dto.asOf } as const;
  if (dto.presentation === 'metric') {
    return { ...shared, presentation: 'metric', metric: dto.metric ?? UNEVALUATED_METRIC };
  }
  if (dto.presentation === 'breakdown') {
    return { ...shared, presentation: 'breakdown', rows: dto.rows ?? [] };
  }
  return { ...shared, presentation: 'tasks', tasks: (dto.tasks ?? []).map(mapTask) };
}

/** Pure DTO → domain projection: rename wire instants to the ISO convention. */
export function mapDashboardSummary(dto: SummaryDto): DashboardSummary {
  return {
    persona: dto.persona,
    generatedAtIso: dto.generatedAt,
    widgets: dto.widgets.map(mapWidget),
  };
}
