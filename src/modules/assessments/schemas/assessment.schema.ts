import { schemaBuilder } from '@/packages/schema';

/** Exact runtime mirrors of the generated NestJS assessment DTOs. */
const isoInstant = schemaBuilder.iso.datetime({ offset: true });

const assessmentStatusSchema = schemaBuilder.enum([
  'draft',
  'submitted',
  'in_review',
  'approved',
  'published',
  'revised',
]);

const assessmentValueResponseSchema = schemaBuilder.object({
  metricDefinitionId: schemaBuilder.string().min(1),
  numericValue: schemaBuilder.number().nullable(),
  textValue: schemaBuilder.string().nullable(),
  note: schemaBuilder.string().nullable(),
  confidence: schemaBuilder.number().nullable(),
  observationCount: schemaBuilder.number().nullable(),
});

const assessmentRecordResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  familyId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().nullable(),
  periodId: schemaBuilder.string().min(1),
  templateId: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  evaluatorUserId: schemaBuilder.string().min(1),
  status: assessmentStatusSchema,
  revision: schemaBuilder.number().int(),
  summary: schemaBuilder.string().nullable(),
  recordVersion: schemaBuilder.number().int(),
  submittedAt: isoInstant.nullable(),
  submittedBy: schemaBuilder.string().nullable(),
  reviewedAt: isoInstant.nullable(),
  reviewedBy: schemaBuilder.string().nullable(),
  publishedAt: isoInstant.nullable(),
  publishedBy: schemaBuilder.string().nullable(),
  supersededAt: isoInstant.nullable(),
  supersededById: schemaBuilder.string().nullable(),
  createdBy: schemaBuilder.string().nullable(),
  createdAt: isoInstant,
  updatedAt: isoInstant,
});

export const playerAssessmentResponseSchema = schemaBuilder.object({
  assessment: assessmentRecordResponseSchema,
  values: schemaBuilder.array(assessmentValueResponseSchema),
});

export const assessmentSummaryResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  familyId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  periodId: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  evaluatorUserId: schemaBuilder.string().min(1),
  status: assessmentStatusSchema,
  revision: schemaBuilder.number().int(),
  recordVersion: schemaBuilder.number().int(),
  createdAt: isoInstant,
  publishedAt: isoInstant.nullable(),
});

export const assessmentListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(assessmentSummaryResponseSchema),
  total: schemaBuilder.number().int().nonnegative(),
  limit: schemaBuilder.number().int().positive(),
  offset: schemaBuilder.number().int().nonnegative(),
});

export const assessmentRevisionsResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(assessmentSummaryResponseSchema),
});

const publishedValueResponseSchema = schemaBuilder.object({
  metricDefinitionId: schemaBuilder.string().min(1),
  numericValue: schemaBuilder.number().nullable(),
  textValue: schemaBuilder.string().nullable(),
});

export const publishedAssessmentResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  periodId: schemaBuilder.string().min(1),
  templateId: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  status: assessmentStatusSchema,
  revision: schemaBuilder.number().int(),
  summary: schemaBuilder.string().nullable(),
  publishedAt: isoInstant.nullable(),
  values: schemaBuilder.array(publishedValueResponseSchema),
});

export const publishedAssessmentListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(publishedAssessmentResponseSchema),
  total: schemaBuilder.number().int().nonnegative(),
  limit: schemaBuilder.number().int().positive(),
  offset: schemaBuilder.number().int().nonnegative(),
});

const templateMetricResponseSchema = schemaBuilder.object({
  metricDefinitionId: schemaBuilder.string().min(1),
  required: schemaBuilder.boolean(),
  sortOrder: schemaBuilder.number().int(),
});

const templateResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  key: schemaBuilder.string(),
  name: schemaBuilder.string(),
  status: schemaBuilder.enum(['draft', 'published', 'archived']),
  version: schemaBuilder.number().int(),
  metrics: schemaBuilder.array(templateMetricResponseSchema),
});

export const templateListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(templateResponseSchema),
  total: schemaBuilder.number().int().nonnegative(),
  limit: schemaBuilder.number().int().positive(),
  offset: schemaBuilder.number().int().nonnegative(),
});

export const metricResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  categoryId: schemaBuilder.string().min(1),
  scaleId: schemaBuilder.string().min(1),
  key: schemaBuilder.string(),
  name: schemaBuilder.string(),
  definition: schemaBuilder.string(),
  direction: schemaBuilder.enum([
    'higher_is_better',
    'lower_is_better',
    'target_range',
    'descriptive',
  ]),
  guidance: schemaBuilder.string(),
  tags: schemaBuilder.array(schemaBuilder.string()),
  status: schemaBuilder.enum(['active', 'archived']),
});

export const metricListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(metricResponseSchema),
  total: schemaBuilder.number().int().nonnegative(),
  limit: schemaBuilder.number().int().positive(),
  offset: schemaBuilder.number().int().nonnegative(),
});

const scaleResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  key: schemaBuilder.string(),
  name: schemaBuilder.string(),
  valueKind: schemaBuilder.enum([
    'legacy_0_5',
    'timed',
    'count',
    'percentage',
    'categorical',
    'text',
  ]),
  unit: schemaBuilder.string().nullable(),
  minimumValue: schemaBuilder.number().nullable(),
  maximumValue: schemaBuilder.number().nullable(),
  stepValue: schemaBuilder.number().nullable(),
  categoricalOptions: schemaBuilder.array(schemaBuilder.string()),
  guidance: schemaBuilder.string(),
});

export const scaleListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(scaleResponseSchema),
  total: schemaBuilder.number().int().nonnegative(),
  limit: schemaBuilder.number().int().positive(),
  offset: schemaBuilder.number().int().nonnegative(),
});

const categoryResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  key: schemaBuilder.string(),
  name: schemaBuilder.string(),
  description: schemaBuilder.string(),
  sortOrder: schemaBuilder.number().int(),
});

export const categoryListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(categoryResponseSchema),
  total: schemaBuilder.number().int().nonnegative(),
  limit: schemaBuilder.number().int().positive(),
  offset: schemaBuilder.number().int().nonnegative(),
});

const periodResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  templateId: schemaBuilder.string().min(1),
  name: schemaBuilder.string(),
  startsOn: schemaBuilder.string(),
  endsOn: schemaBuilder.string(),
  status: schemaBuilder.enum(['active', 'archived']),
});

export const periodListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(periodResponseSchema),
  total: schemaBuilder.number().int().nonnegative(),
  limit: schemaBuilder.number().int().positive(),
  offset: schemaBuilder.number().int().nonnegative(),
});
