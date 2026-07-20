import type { SchemaOutput } from '@/packages/schema';

import { METRIC_SOURCE, METRIC_SOURCE_TAGS } from '../constants/assessments.constants';
import type { MetricSource } from '../constants/assessments.constants';
import type {
  assessmentListResponseSchema,
  assessmentSummaryResponseSchema,
  categoryListResponseSchema,
  metricListResponseSchema,
  metricResponseSchema,
  periodListResponseSchema,
  playerAssessmentResponseSchema,
  publishedAssessmentListResponseSchema,
  publishedAssessmentResponseSchema,
  scaleListResponseSchema,
  templateListResponseSchema,
} from '../schemas/assessment.schema';
import type {
  AssessmentCatalog,
  AssessmentDetail,
  AssessmentPage,
  AssessmentSummary,
  MetricDefinition,
  PublishedAssessment,
} from '../types/assessments.types';

type DetailDto = SchemaOutput<typeof playerAssessmentResponseSchema>;
type SummaryDto = SchemaOutput<typeof assessmentSummaryResponseSchema>;
type ListDto = SchemaOutput<typeof assessmentListResponseSchema>;
type PublishedDto = SchemaOutput<typeof publishedAssessmentResponseSchema>;
type PublishedListDto = SchemaOutput<typeof publishedAssessmentListResponseSchema>;
type MetricDto = SchemaOutput<typeof metricResponseSchema>;

interface CatalogDtos {
  readonly templates: SchemaOutput<typeof templateListResponseSchema>;
  readonly metrics: SchemaOutput<typeof metricListResponseSchema>;
  readonly scales: SchemaOutput<typeof scaleListResponseSchema>;
  readonly categories: SchemaOutput<typeof categoryListResponseSchema>;
  readonly periods: SchemaOutput<typeof periodListResponseSchema>;
}

/**
 * Classify where a metric's number comes from so the UI can distinguish a
 * coach judgement from a measured or imported figure. Unknown tag sets stay
 * subjective — the safest reading of an evaluator-entered score.
 */
function mapMetricSource(tags: readonly string[]): MetricSource {
  const normalized = tags.map((tag) => tag.toLowerCase());
  const match = METRIC_SOURCE_TAGS.find(([tag]) => normalized.includes(tag));
  return match === undefined ? METRIC_SOURCE.Subjective : match[1];
}

function mapMetric(dto: MetricDto): MetricDefinition {
  return {
    id: dto.id,
    categoryId: dto.categoryId,
    scaleId: dto.scaleId,
    key: dto.key,
    name: dto.name,
    definition: dto.definition,
    direction: dto.direction,
    guidance: dto.guidance,
    tags: dto.tags,
    source: mapMetricSource(dto.tags),
  };
}

/** One assessment plus its values; `null` stays `null` at every hop. */
export function mapAssessmentDetail(dto: DetailDto): AssessmentDetail {
  return {
    assessment: {
      id: dto.assessment.id,
      familyId: dto.assessment.familyId,
      teamId: dto.assessment.teamId,
      seasonId: dto.assessment.seasonId,
      periodId: dto.assessment.periodId,
      templateId: dto.assessment.templateId,
      membershipId: dto.assessment.membershipId,
      evaluatorUserId: dto.assessment.evaluatorUserId,
      status: dto.assessment.status,
      revision: dto.assessment.revision,
      summary: dto.assessment.summary,
      recordVersion: dto.assessment.recordVersion,
      submittedAtIso: dto.assessment.submittedAt,
      reviewedAtIso: dto.assessment.reviewedAt,
      publishedAtIso: dto.assessment.publishedAt,
      supersededAtIso: dto.assessment.supersededAt,
      createdAtIso: dto.assessment.createdAt,
      updatedAtIso: dto.assessment.updatedAt,
    },
    values: dto.values.map((value) => ({
      metricDefinitionId: value.metricDefinitionId,
      numericValue: value.numericValue,
      textValue: value.textValue,
      note: value.note,
      confidence: value.confidence,
      observationCount: value.observationCount,
    })),
  };
}

export function mapAssessmentSummary(dto: SummaryDto): AssessmentSummary {
  return {
    id: dto.id,
    familyId: dto.familyId,
    teamId: dto.teamId,
    periodId: dto.periodId,
    membershipId: dto.membershipId,
    evaluatorUserId: dto.evaluatorUserId,
    status: dto.status,
    revision: dto.revision,
    recordVersion: dto.recordVersion,
    createdAtIso: dto.createdAt,
    publishedAtIso: dto.publishedAt,
  };
}

export function mapAssessmentPage(dto: ListDto): AssessmentPage {
  return {
    items: dto.items.map((item) => mapAssessmentSummary(item)),
    total: dto.total,
    pageSize: dto.limit,
    hasMore: dto.offset + dto.items.length < dto.total,
  };
}

function mapPublishedAssessment(dto: PublishedDto): PublishedAssessment {
  return {
    id: dto.id,
    teamId: dto.teamId,
    periodId: dto.periodId,
    templateId: dto.templateId,
    membershipId: dto.membershipId,
    revision: dto.revision,
    summary: dto.summary,
    publishedAtIso: dto.publishedAt,
    values: dto.values.map((value) => ({
      metricDefinitionId: value.metricDefinitionId,
      numericValue: value.numericValue,
      textValue: value.textValue,
    })),
  };
}

export function mapPublishedAssessments(dto: PublishedListDto): readonly PublishedAssessment[] {
  return dto.items.map((item) => mapPublishedAssessment(item));
}

/** Fold the five catalog collections into the shape the grid consumes. */
export function mapAssessmentCatalog(dtos: CatalogDtos): AssessmentCatalog {
  return {
    templates: dtos.templates.items.map((template) => ({
      id: template.id,
      teamId: template.teamId,
      key: template.key,
      name: template.name,
      version: template.version,
      metrics: template.metrics.map((metric) => ({
        metricDefinitionId: metric.metricDefinitionId,
        required: metric.required,
        sortOrder: metric.sortOrder,
      })),
    })),
    metrics: dtos.metrics.items.map((metric) => mapMetric(metric)),
    scales: dtos.scales.items.map((scale) => ({
      id: scale.id,
      key: scale.key,
      name: scale.name,
      valueKind: scale.valueKind,
      unit: scale.unit,
      minimumValue: scale.minimumValue,
      maximumValue: scale.maximumValue,
      stepValue: scale.stepValue,
      categoricalOptions: scale.categoricalOptions,
      guidance: scale.guidance,
    })),
    categories: dtos.categories.items.map((category) => ({
      id: category.id,
      key: category.key,
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder,
    })),
    periods: dtos.periods.items.map((period) => ({
      id: period.id,
      teamId: period.teamId,
      templateId: period.templateId,
      name: period.name,
      startsOn: period.startsOn,
      endsOn: period.endsOn,
    })),
  };
}
