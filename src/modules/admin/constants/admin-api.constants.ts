/**
 * Admin paths, relative to the versioned API base URL. Everything here is
 * published in `contracts/openapi.json` (contract 1.2.0 shipped the last two
 * pending surfaces — dead letters and job health — plus the platform
 * super-admin roster; see docs/api-verification.md).
 */
function teamPath(teamId: string, suffix: string): string {
  return `/teams/${encodeURIComponent(teamId)}${suffix}`;
}

export function settingsSnapshotPath(teamId: string): string {
  return teamPath(teamId, '/settings/snapshot');
}

export function settingVersionsPath(teamId: string): string {
  return teamPath(teamId, '/settings/versions');
}

/** One scheduled version, addressed for the future-only cancel (DELETE). */
export function settingVersionPath(teamId: string, versionId: string): string {
  return `${settingVersionsPath(teamId)}/${encodeURIComponent(versionId)}`;
}

export function seasonsPath(teamId: string): string {
  return teamPath(teamId, '/seasons');
}

export function venuesPath(teamId: string): string {
  return teamPath(teamId, '/venues');
}

export function catalogEntriesPath(teamId: string): string {
  return teamPath(teamId, '/catalog-entries');
}

export function pointsRulesPath(teamId: string): string {
  return teamPath(teamId, '/points-rules');
}

export function pointsRuleTransitionPath(teamId: string, ruleId: string): string {
  return `${pointsRulesPath(teamId)}/${encodeURIComponent(ruleId)}/transition`;
}

export function calculationRulesPath(teamId: string): string {
  return teamPath(teamId, '/calculation-rules');
}

export function calculationRuleTransitionPath(teamId: string, ruleId: string): string {
  return `${calculationRulesPath(teamId)}/${encodeURIComponent(ruleId)}/transition`;
}

export function calculationRuleSimulatePath(teamId: string, ruleId: string): string {
  return `${calculationRulesPath(teamId)}/${encodeURIComponent(ruleId)}/simulate`;
}

export function auditPath(teamId: string): string {
  return teamPath(teamId, '/audit');
}

export function outboxMetricsPath(): string {
  return '/admin/outbox/metrics';
}

export function outboxReplayPath(eventId: string): string {
  return `/admin/outbox/${encodeURIComponent(eventId)}/replay`;
}

/** The dead-letter listing behind the metrics counters (contract 1.2.0). */
export function outboxDeadLettersPath(): string {
  return '/admin/outbox/dead-letters';
}

/** Scheduled-job health, derived from real recorded runs (contract 1.2.0). */
export function jobHealthPath(): string {
  return '/admin/jobs/health';
}

/** Platform-scoped super administrator roster (global `platform.admin` only). */
export function superAdminsPath(): string {
  return '/rbac/platform/super-admins';
}

/** One super administrator's assignment, addressed by user id (revoke). */
export function superAdminPath(userId: string): string {
  return `${superAdminsPath()}/${encodeURIComponent(userId)}`;
}

/**
 * Capability-honesty markers for endpoints the backend does not serve yet.
 * While a marker is `true` the operations centre never issues the request and
 * shows the designed "not available yet" panel instead of a retried 404
 * posing as "Loading…". Contract 1.2.0 shipped the dead-letter listing and
 * job health for real, so both markers are OFF; the machinery stays for the
 * next latent surface.
 */
export const ADMIN_BACKEND_PENDING = {
  deadLetters: false,
  jobHealth: false,
} as const;
