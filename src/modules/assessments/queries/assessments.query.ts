import { getAssessmentCatalog } from '../services/get-assessment-catalog.service';
import { getAssessment } from '../services/get-assessment.service';
import { getAssessmentRevisions } from '../services/get-assessment-revisions.service';
import { listTeamAssessments } from '../services/list-team-assessments.service';
import { assessmentsQueryKeys } from './assessments.keys';

/** Query options for one bounded page of team assessments. */
export function buildTeamAssessmentsQueryOptions(teamId: string) {
  return {
    queryKey: assessmentsQueryKeys.list(teamId),
    queryFn: () => listTeamAssessments(teamId),
    enabled: teamId !== '',
  };
}

/** Query options for one assessment with its values. */
export function buildAssessmentQueryOptions(teamId: string, assessmentId: string) {
  return {
    queryKey: assessmentsQueryKeys.detail(teamId, assessmentId),
    queryFn: () => getAssessment(teamId, assessmentId),
    enabled: teamId !== '' && assessmentId !== '',
  };
}

/** Query options for the revision family of one assessment. */
export function buildAssessmentRevisionsQueryOptions(teamId: string, assessmentId: string) {
  return {
    queryKey: assessmentsQueryKeys.revisions(teamId, assessmentId),
    queryFn: () => getAssessmentRevisions(teamId, assessmentId),
    enabled: teamId !== '' && assessmentId !== '',
  };
}

/**
 * Query options for the assessment catalog (rarely changes; cached longer).
 * The five catalog endpoints require the staff-only `assessment.read.team`
 * grant, so the query only fires once the caller proves that grant — a member
 * opening My Performance must issue ZERO forbidden catalog requests.
 */
export function buildAssessmentCatalogQueryOptions(teamId: string, canReadCatalog: boolean) {
  return {
    queryKey: assessmentsQueryKeys.catalog(teamId),
    queryFn: () => getAssessmentCatalog(teamId),
    enabled: teamId !== '' && canReadCatalog,
  };
}
