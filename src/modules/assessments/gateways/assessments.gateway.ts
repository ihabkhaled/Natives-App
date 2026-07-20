import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  assessmentCatalogPath,
  CATALOG_RESOURCES,
  assessmentRevisionsPath,
  assessmentValuesPath,
  assessmentWorkflowPath,
  myAssessmentsPath,
  playerAssessmentPath,
  playerAssessmentsPath,
  WORKFLOW_STEP_PATHS,
} from '../constants/assessments-api.constants';
import {
  assessmentListResponseSchema,
  assessmentRevisionsResponseSchema,
  categoryListResponseSchema,
  metricListResponseSchema,
  periodListResponseSchema,
  playerAssessmentResponseSchema,
  publishedAssessmentListResponseSchema,
  scaleListResponseSchema,
  templateListResponseSchema,
} from '../schemas/assessment.schema';
import type { ReviewDecision } from '../constants/assessments.constants';
import type { SaveAssessmentValuesInput } from '../types/assessments.types';

type ListDto = SchemaOutput<typeof assessmentListResponseSchema>;
type DetailDto = SchemaOutput<typeof playerAssessmentResponseSchema>;
type RevisionsDto = SchemaOutput<typeof assessmentRevisionsResponseSchema>;
type PublishedListDto = SchemaOutput<typeof publishedAssessmentListResponseSchema>;
type TemplateListDto = SchemaOutput<typeof templateListResponseSchema>;
type MetricListDto = SchemaOutput<typeof metricListResponseSchema>;
type ScaleListDto = SchemaOutput<typeof scaleListResponseSchema>;
type CategoryListDto = SchemaOutput<typeof categoryListResponseSchema>;
type PeriodListDto = SchemaOutput<typeof periodListResponseSchema>;

/** One bounded, deterministically ordered page of team assessments. */
export function requestTeamAssessments(
  teamId: string,
  limit: number,
  offset: number,
): Promise<ListDto> {
  return getAppHttpClient().get(playerAssessmentsPath(teamId), assessmentListResponseSchema, {
    params: { limit, offset },
  });
}

/** One assessment with its values, schema-parsed. */
export function requestAssessment(teamId: string, assessmentId: string): Promise<DetailDto> {
  return getAppHttpClient().get(
    playerAssessmentPath(teamId, assessmentId),
    playerAssessmentResponseSchema,
  );
}

/** The revision family of one assessment. */
export function requestAssessmentRevisions(
  teamId: string,
  assessmentId: string,
): Promise<RevisionsDto> {
  return getAppHttpClient().get(
    assessmentRevisionsPath(teamId, assessmentId),
    assessmentRevisionsResponseSchema,
  );
}

/** Autosave a draft's values under optimistic concurrency. */
export function requestSaveAssessmentValues(
  teamId: string,
  assessmentId: string,
  input: SaveAssessmentValuesInput,
): Promise<DetailDto> {
  return getAppHttpClient().put(
    assessmentValuesPath(teamId, assessmentId),
    {
      expectedRecordVersion: input.expectedRecordVersion,
      summary: input.summary,
      values: input.values.map((value) => ({
        metricDefinitionId: value.metricDefinitionId,
        numericValue: value.numericValue,
        textValue: value.textValue,
        note: value.note,
      })),
    },
    playerAssessmentResponseSchema,
  );
}

/** Submit a draft for review. */
export function requestSubmitAssessment(
  teamId: string,
  assessmentId: string,
  expectedRecordVersion: number,
): Promise<DetailDto> {
  return getAppHttpClient().post(
    assessmentWorkflowPath(teamId, assessmentId, WORKFLOW_STEP_PATHS.submit),
    { expectedRecordVersion },
    playerAssessmentResponseSchema,
  );
}

/** Claim, approve, or send back a submitted assessment. */
export function requestReviewAssessment(
  teamId: string,
  assessmentId: string,
  expectedRecordVersion: number,
  decision: ReviewDecision,
): Promise<DetailDto> {
  return getAppHttpClient().post(
    assessmentWorkflowPath(teamId, assessmentId, WORKFLOW_STEP_PATHS.review),
    { expectedRecordVersion, decision },
    playerAssessmentResponseSchema,
  );
}

/** Publish an approved assessment to its player. */
export function requestPublishAssessment(
  teamId: string,
  assessmentId: string,
  expectedRecordVersion: number,
): Promise<DetailDto> {
  return getAppHttpClient().post(
    assessmentWorkflowPath(teamId, assessmentId, WORKFLOW_STEP_PATHS.publish),
    { expectedRecordVersion },
    playerAssessmentResponseSchema,
  );
}

/** The signed-in player's own published assessments. */
export function requestMyAssessments(
  teamId: string,
  limit: number,
  offset: number,
): Promise<PublishedListDto> {
  return getAppHttpClient().get(myAssessmentsPath(teamId), publishedAssessmentListResponseSchema, {
    params: { limit, offset },
  });
}

export function requestAssessmentTemplates(teamId: string): Promise<TemplateListDto> {
  return getAppHttpClient().get(
    assessmentCatalogPath(teamId, CATALOG_RESOURCES.templates),
    templateListResponseSchema,
  );
}

export function requestAssessmentMetrics(teamId: string): Promise<MetricListDto> {
  return getAppHttpClient().get(
    assessmentCatalogPath(teamId, CATALOG_RESOURCES.metrics),
    metricListResponseSchema,
  );
}

export function requestAssessmentScales(teamId: string): Promise<ScaleListDto> {
  return getAppHttpClient().get(
    assessmentCatalogPath(teamId, CATALOG_RESOURCES.scales),
    scaleListResponseSchema,
  );
}

export function requestAssessmentCategories(teamId: string): Promise<CategoryListDto> {
  return getAppHttpClient().get(
    assessmentCatalogPath(teamId, CATALOG_RESOURCES.categories),
    categoryListResponseSchema,
  );
}

export function requestAssessmentPeriods(teamId: string): Promise<PeriodListDto> {
  return getAppHttpClient().get(
    assessmentCatalogPath(teamId, CATALOG_RESOURCES.periods),
    periodListResponseSchema,
  );
}
