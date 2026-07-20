import {
  requestAssessmentCategories,
  requestAssessmentMetrics,
  requestAssessmentPeriods,
  requestAssessmentScales,
  requestAssessmentTemplates,
} from '../gateways/assessments.gateway';
import { runAssessmentsRequest } from '../helpers/to-assessments-error.helper';
import { mapAssessmentCatalog } from '../mappers/assessment.mapper';
import type { AssessmentCatalog } from '../types/assessments.types';

/** Use case: load the template, metric, scale, category, and period catalog. */
export function getAssessmentCatalog(teamId: string): Promise<AssessmentCatalog> {
  return runAssessmentsRequest(async () => {
    const [templates, metrics, scales, categories, periods] = await Promise.all([
      requestAssessmentTemplates(teamId),
      requestAssessmentMetrics(teamId),
      requestAssessmentScales(teamId),
      requestAssessmentCategories(teamId),
      requestAssessmentPeriods(teamId),
    ]);
    return mapAssessmentCatalog({ templates, metrics, scales, categories, periods });
  });
}
