/** Stable, team-scoped query-key builders for the reports cache. */
export const reportsQueryKeys = {
  all: ['reports'] as const,
  team: (teamId: string) => [...reportsQueryKeys.all, 'team', teamId] as const,
  jobs: (teamId: string, template: string, status: string, offset: number) =>
    [...reportsQueryKeys.team(teamId), 'jobs', template, status, offset] as const,
  job: (teamId: string, jobId: string) => [...reportsQueryKeys.team(teamId), 'job', jobId] as const,
};
