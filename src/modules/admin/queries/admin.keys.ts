/** Stable query-key builders for the admin cache. */
export const adminQueryKeys = {
  all: ['admin'] as const,
  team: (teamId: string) => [...adminQueryKeys.all, 'team', teamId] as const,
  settingsSnapshot: (teamId: string) => [...adminQueryKeys.team(teamId), 'settings'] as const,
  settingsSnapshotAt: (teamId: string, asOf: string) =>
    [...adminQueryKeys.settingsSnapshot(teamId), 'as-of', asOf] as const,
  settingVersions: (teamId: string, settingKey: string) =>
    [...adminQueryKeys.settingsSnapshot(teamId), 'versions', settingKey] as const,
  seasons: (teamId: string) => [...adminQueryKeys.team(teamId), 'seasons'] as const,
  venues: (teamId: string) => [...adminQueryKeys.team(teamId), 'venues'] as const,
  catalog: (teamId: string, catalog: string) =>
    [...adminQueryKeys.team(teamId), 'catalog', catalog] as const,
  rules: (teamId: string, family: string) =>
    [...adminQueryKeys.team(teamId), 'rules', family] as const,
  operations: () => [...adminQueryKeys.all, 'operations'] as const,
  platformAdmins: () => [...adminQueryKeys.all, 'platform-admins'] as const,
  outboxMetrics: () => [...adminQueryKeys.operations(), 'outbox-metrics'] as const,
  deadLetters: () => [...adminQueryKeys.operations(), 'dead-letters'] as const,
  jobHealth: () => [...adminQueryKeys.operations(), 'job-health'] as const,
  audit: (teamId: string) => [...adminQueryKeys.team(teamId), 'audit'] as const,
};
