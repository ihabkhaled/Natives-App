/** Stable, team-scoped query-key builders for the external-training cache. */
export const trainingQueryKeys = {
  all: ['training'] as const,
  team: (teamId: string) => [...trainingQueryKeys.all, 'team', teamId] as const,
  types: (teamId: string) => [...trainingQueryKeys.team(teamId), 'activity-types'] as const,
  mySubmissions: (teamId: string) => [...trainingQueryKeys.team(teamId), 'my-submissions'] as const,
  myBuddies: (teamId: string) => [...trainingQueryKeys.team(teamId), 'my-buddies'] as const,
  submission: (teamId: string, submissionId: string) =>
    [...trainingQueryKeys.team(teamId), 'submission', submissionId] as const,
  evidence: (teamId: string, submissionId: string) =>
    [...trainingQueryKeys.submission(teamId, submissionId), 'evidence'] as const,
  reviewQueue: (teamId: string, status: string) =>
    [...trainingQueryKeys.team(teamId), 'review-queue', status] as const,
  reviewDetail: (teamId: string, submissionId: string) =>
    [...trainingQueryKeys.team(teamId), 'review-detail', submissionId] as const,
};
