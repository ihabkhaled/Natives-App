/** Stable, team-scoped query-key builders for the assessments cache. */
export const assessmentsQueryKeys = {
  all: ['assessments'] as const,
  team: (teamId: string) => [...assessmentsQueryKeys.all, 'team', teamId] as const,
  list: (teamId: string) => [...assessmentsQueryKeys.team(teamId), 'list'] as const,
  detail: (teamId: string, assessmentId: string) =>
    [...assessmentsQueryKeys.team(teamId), 'detail', assessmentId] as const,
  revisions: (teamId: string, assessmentId: string) =>
    [...assessmentsQueryKeys.detail(teamId, assessmentId), 'revisions'] as const,
  catalog: (teamId: string) => [...assessmentsQueryKeys.team(teamId), 'catalog'] as const,
  myAssessments: (teamId: string) =>
    [...assessmentsQueryKeys.team(teamId), 'my-assessments'] as const,
  myFeedback: (teamId: string) => [...assessmentsQueryKeys.team(teamId), 'my-feedback'] as const,
  myGoals: (teamId: string) => [...assessmentsQueryKeys.team(teamId), 'my-goals'] as const,
  myScore: (teamId: string) => [...assessmentsQueryKeys.team(teamId), 'my-score'] as const,
  myMeasurements: (teamId: string) =>
    [...assessmentsQueryKeys.team(teamId), 'my-measurements'] as const,
};
