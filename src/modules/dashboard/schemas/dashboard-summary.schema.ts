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

const dashboardMetricWidgetSchema = schemaBuilder.object({
  kind: schemaBuilder.string().min(1),
  presentation: schemaBuilder.literal('metric'),
  status: dashboardWidgetStatusSchema,
  asOf: schemaBuilder.iso.datetime({ offset: true }).nullable(),
  metric: dashboardMetricSchema,
});

const dashboardBreakdownWidgetSchema = schemaBuilder.object({
  kind: schemaBuilder.string().min(1),
  presentation: schemaBuilder.literal('breakdown'),
  status: dashboardWidgetStatusSchema,
  asOf: schemaBuilder.iso.datetime({ offset: true }).nullable(),
  rows: schemaBuilder.array(dashboardBreakdownRowSchema),
});

const dashboardTasksWidgetSchema = schemaBuilder.object({
  kind: schemaBuilder.string().min(1),
  presentation: schemaBuilder.literal('tasks'),
  status: dashboardWidgetStatusSchema,
  asOf: schemaBuilder.iso.datetime({ offset: true }).nullable(),
  tasks: schemaBuilder.array(dashboardTaskSchema),
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
