/**
 * Admin paths, relative to the versioned API base URL. Everything here is
 * published in `contracts/openapi.json`; the operations centre's dead-letter
 * listing and job health are the two backend-pending surfaces and are marked
 * as such in docs/api-verification.md.
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

/** Backend-pending: the dead-letter listing behind the metrics counters. */
export function outboxDeadLettersPath(): string {
  return '/admin/outbox/dead-letters';
}

/** Backend-pending: scheduled-job health. */
export function jobHealthPath(): string {
  return '/admin/jobs/health';
}

/**
 * Capability-honesty markers for endpoints the backend does not serve yet
 * (both currently answer 404 in production). While a marker is `true` the
 * operations centre never issues the request and shows the designed
 * "not available yet" panel instead of a retried 404 posing as "Loading…".
 * When the backend ships an endpoint, flipping its marker to `false` lights
 * the panel up again — no other change needed.
 */
export const ADMIN_BACKEND_PENDING = {
  deadLetters: true,
  jobHealth: true,
} as const;
