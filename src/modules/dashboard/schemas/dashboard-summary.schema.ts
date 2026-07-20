import { schemaBuilder } from '@/packages/schema';

/**
 * Wire contract for GET /dashboard/summary, shared by remote NestJS mode and
 * MSW mock mode. Widgets are a discriminated union on `presentation` so each
 * shape validates independently. Numeric projections are nullable: null means
 * "not evaluated" and is never coerced to zero.
 */
const dashboardToneSchema = schemaBuilder.enum(['positive', 'neutral', 'attention', 'critical']);

const dashboardMetricSchema = schemaBuilder.object({
  value: schemaBuilder.number().nullable(),
  displayValue: schemaBuilder.string().nullable(),
  unit: schemaBuilder.enum(['percent', 'points', 'rank']).nullable(),
  tone: dashboardToneSchema,
});

const dashboardBreakdownRowSchema = schemaBuilder.object({
  key: schemaBuilder.string().min(1),
  labelKey: schemaBuilder.string().min(1),
  value: schemaBuilder.number().nullable(),
  displayValue: schemaBuilder.string().nullable(),
});

const dashboardTaskSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  labelKey: schemaBuilder.string().min(1),
  count: schemaBuilder.number().int().nullable(),
  tone: dashboardToneSchema,
  occurredAt: schemaBuilder.iso.datetime({ offset: true }).nullable(),
});

const dashboardWidgetStatusSchema = schemaBuilder.enum([
  'ready',
  'empty',
  'partial',
  'unavailable',
]);

/**
 * The backend marks `metric`, `rows`, and `tasks` optional on
 * `DashboardWidgetDto`: a widget whose status is `empty` or `unavailable`
 * carries no payload at all. Each presentation therefore accepts its own
 * payload as optional and the mapper supplies an explicitly-unknown
 * projection rather than a fabricated zero.
 */
const dashboardMetricWidgetSchema = schemaBuilder.object({
  kind: schemaBuilder.string().min(1),
  presentation: schemaBuilder.literal('metric'),
  status: dashboardWidgetStatusSchema,
  asOf: schemaBuilder.iso.datetime({ offset: true }).nullable(),
  metric: dashboardMetricSchema.optional(),
});

const dashboardBreakdownWidgetSchema = schemaBuilder.object({
  kind: schemaBuilder.string().min(1),
  presentation: schemaBuilder.literal('breakdown'),
  status: dashboardWidgetStatusSchema,
  asOf: schemaBuilder.iso.datetime({ offset: true }).nullable(),
  rows: schemaBuilder.array(dashboardBreakdownRowSchema).optional(),
});

const dashboardTasksWidgetSchema = schemaBuilder.object({
  kind: schemaBuilder.string().min(1),
  presentation: schemaBuilder.literal('tasks'),
  status: dashboardWidgetStatusSchema,
  asOf: schemaBuilder.iso.datetime({ offset: true }).nullable(),
  tasks: schemaBuilder.array(dashboardTaskSchema).optional(),
});

const dashboardWidgetSchema = schemaBuilder.discriminatedUnion('presentation', [
  dashboardMetricWidgetSchema,
  dashboardBreakdownWidgetSchema,
  dashboardTasksWidgetSchema,
]);

export const dashboardSummaryResponseSchema = schemaBuilder.object({
  persona: schemaBuilder.enum(['member', 'coach', 'administrator']),
  generatedAt: schemaBuilder.iso.datetime({ offset: true }),
  widgets: schemaBuilder.array(dashboardWidgetSchema),
});
