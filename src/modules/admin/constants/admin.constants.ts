/**
 * Admin-domain vocabulary. Wire values mirror the deployed settings, points,
 * scoring, audit, and outbox contracts; the client owns the i18n key each
 * value renders through, so raw backend copy is never displayed.
 */
export const SETTING_KEYS = [
  'attendance_statuses',
  'session_types',
  'attendance_weights',
  'assessment_scale',
  'badge_tiers',
  'roster_limits',
  'notification_rules',
  'report_branding',
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export const SEASON_STATUSES = ['draft', 'active', 'archived'] as const;

export type SeasonStatus = (typeof SEASON_STATUSES)[number];

export const VENUE_STATUSES = ['active', 'archived'] as const;

export type VenueStatus = (typeof VENUE_STATUSES)[number];

export const CATALOG_KINDS = ['division', 'gender_format', 'position'] as const;

export type CatalogKind = (typeof CATALOG_KINDS)[number];

export const CATALOG_STATUSES = ['active', 'archived'] as const;

/** DRAFT → APPROVED → PUBLISHED → RETIRED, with an explicit revert. */
export const RULE_STATUSES = ['draft', 'approved', 'published', 'retired'] as const;

export type RuleStatus = (typeof RULE_STATUSES)[number];

export const RULE_TRANSITIONS = ['approve', 'publish', 'retire', 'revert'] as const;

export type RuleTransition = (typeof RULE_TRANSITIONS)[number];

/** Which of the two versioned rule surfaces a screen is looking at. */
export const RULE_FAMILIES = ['points', 'calculation'] as const;

export type RuleFamily = (typeof RULE_FAMILIES)[number];

export const ALL_STATUSES_FILTER = 'all';

export const AUDIT_OUTCOMES = ['success', 'failure', 'denied'] as const;

export type AuditOutcome = (typeof AUDIT_OUTCOMES)[number];

export const JOB_STATUSES = ['healthy', 'degraded', 'failed'] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const CONFIDENCE_LEVELS = ['none', 'low', 'medium', 'high'] as const;

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

/** Every admin list is bounded; these are the windows the screens ask for. */
export const ADMIN_LIMITS = {
  settingVersions: 20,
  seasons: 50,
  venues: 50,
  catalogEntries: 100,
  rules: 50,
  audit: 25,
  deadLetters: 25,
  members: 50,
  minimumReasonLength: 5,
} as const;

/**
 * Transitions that must not be offered until a dry run has been seen. Rule
 * activation is the one high-risk step where a preview is not optional.
 */
export const SIMULATION_REQUIRED_TRANSITIONS: readonly RuleTransition[] = ['publish'];
