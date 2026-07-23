import { getMyMeasurements } from '../services/get-my-measurements.service';
import { getMyScore } from '../services/get-my-score.service';
import { listMyAssessments } from '../services/list-my-assessments.service';
import { listMyFeedback } from '../services/list-my-feedback.service';
import { listMyGoals } from '../services/list-my-goals.service';
import { assessmentsQueryKeys } from './assessments.keys';

/** Query options for the signed-in player own published assessments. */
export function buildMyAssessmentsQueryOptions(teamId: string) {
  return {
    queryKey: assessmentsQueryKeys.myAssessments(teamId),
    queryFn: () => listMyAssessments(teamId),
    enabled: teamId !== '',
  };
}

/** Query options for the signed-in player own published coach feedback. */
export function buildMyFeedbackQueryOptions(teamId: string) {
  return {
    queryKey: assessmentsQueryKeys.myFeedback(teamId),
    queryFn: () => listMyFeedback(teamId),
    enabled: teamId !== '',
  };
}

/** Query options for the signed-in player own development goals. */
export function buildMyGoalsQueryOptions(teamId: string) {
  return {
    queryKey: assessmentsQueryKeys.myGoals(teamId),
    queryFn: () => listMyGoals(teamId),
    enabled: teamId !== '',
  };
}

/**
 * Query options for the own computed score. The endpoint requires
 * `analytics.read.self`, so the query only fires once the caller proves that
 * grant — no forbidden request is ever issued from the member tab.
 */
export function buildMyScoreQueryOptions(teamId: string, canReadOwnAnalytics: boolean) {
  return {
    queryKey: assessmentsQueryKeys.myScore(teamId),
    queryFn: () => getMyScore(teamId),
    enabled: teamId !== '' && canReadOwnAnalytics,
  };
}

/** Query options for the own measurement history (same self grant rule). */
export function buildMyMeasurementsQueryOptions(teamId: string, canReadOwnAnalytics: boolean) {
  return {
    queryKey: assessmentsQueryKeys.myMeasurements(teamId),
    queryFn: () => getMyMeasurements(teamId),
    enabled: teamId !== '' && canReadOwnAnalytics,
  };
}
