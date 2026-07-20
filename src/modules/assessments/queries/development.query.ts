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
