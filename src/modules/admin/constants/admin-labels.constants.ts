import { I18N_KEYS } from '@/shared/i18n';

import type {
  AuditOutcome,
  CatalogKind,
  ConfidenceLevel,
  JobStatus,
  RuleStatus,
  RuleTransition,
  SeasonStatus,
  SettingKey,
} from './admin.constants';

export const SETTING_KEY_LABEL_KEYS: Record<SettingKey, string> = {
  attendance_statuses: I18N_KEYS.adminSettings.keyAttendanceStatuses,
  session_types: I18N_KEYS.adminSettings.keySessionTypes,
  attendance_weights: I18N_KEYS.adminSettings.keyAttendanceWeights,
  assessment_scale: I18N_KEYS.adminSettings.keyAssessmentScale,
  badge_tiers: I18N_KEYS.adminSettings.keyBadgeTiers,
  roster_limits: I18N_KEYS.adminSettings.keyRosterLimits,
  notification_rules: I18N_KEYS.adminSettings.keyNotificationRules,
  report_branding: I18N_KEYS.adminSettings.keyReportBranding,
};

export const SEASON_STATUS_LABEL_KEYS: Record<SeasonStatus, string> = {
  draft: I18N_KEYS.adminSettings.statusDraft,
  active: I18N_KEYS.adminSettings.statusActive,
  closed: I18N_KEYS.adminSettings.statusClosed,
  archived: I18N_KEYS.adminSettings.statusArchived,
};

/** Ionic colour tokens only; gold stays reserved for achievements. */
export const SEASON_STATUS_TONES: Record<SeasonStatus, string> = {
  draft: 'medium',
  active: 'success',
  closed: 'medium',
  archived: 'medium',
};

export const CATALOG_LABEL_KEYS: Record<CatalogKind, string> = {
  division: I18N_KEYS.adminSettings.catalogDivision,
  gender_format: I18N_KEYS.adminSettings.catalogGenderFormat,
  position: I18N_KEYS.adminSettings.catalogPosition,
};

export const RULE_STATUS_LABEL_KEYS: Record<RuleStatus, string> = {
  draft: I18N_KEYS.adminRules.statusDraft,
  approved: I18N_KEYS.adminRules.statusApproved,
  published: I18N_KEYS.adminRules.statusPublished,
  retired: I18N_KEYS.adminRules.statusRetired,
};

export const RULE_STATUS_TONES: Record<RuleStatus, string> = {
  draft: 'medium',
  approved: 'secondary',
  published: 'success',
  retired: 'warning',
};

export const RULE_TRANSITION_LABEL_KEYS: Record<RuleTransition, string> = {
  approve: I18N_KEYS.adminRules.transitionApprove,
  publish: I18N_KEYS.adminRules.transitionPublish,
  retire: I18N_KEYS.adminRules.transitionRetire,
  revert: I18N_KEYS.adminRules.transitionRevert,
};

export const CONFIDENCE_LABEL_KEYS: Record<ConfidenceLevel, string> = {
  none: I18N_KEYS.adminRules.confidenceNone,
  low: I18N_KEYS.adminRules.confidenceLow,
  medium: I18N_KEYS.adminRules.confidenceMedium,
  high: I18N_KEYS.adminRules.confidenceHigh,
};

export const AUDIT_OUTCOME_LABEL_KEYS: Record<AuditOutcome, string> = {
  success: I18N_KEYS.adminOperations.auditOutcomeSuccess,
  failure: I18N_KEYS.adminOperations.auditOutcomeFailure,
  denied: I18N_KEYS.adminOperations.auditOutcomeDenied,
};

export const AUDIT_OUTCOME_TONES: Record<AuditOutcome, string> = {
  success: 'success',
  failure: 'danger',
  denied: 'warning',
};

export const JOB_STATUS_LABEL_KEYS: Record<JobStatus, string> = {
  healthy: I18N_KEYS.adminOperations.jobStatusHealthy,
  degraded: I18N_KEYS.adminOperations.jobStatusDegraded,
  failed: I18N_KEYS.adminOperations.jobStatusFailed,
};

export const JOB_STATUS_TONES: Record<JobStatus, string> = {
  healthy: 'success',
  degraded: 'warning',
  failed: 'danger',
};

/** The shared async-state copy each admin screen draws from. */
export const ADMIN_CONSOLE_COPY = I18N_KEYS.adminConsole;
export const ADMIN_SETTINGS_COPY = I18N_KEYS.adminSettings;
export const ADMIN_ROLES_COPY = I18N_KEYS.adminRoles;
export const ADMIN_RULES_COPY = I18N_KEYS.adminRules;
export const ADMIN_OPERATIONS_COPY = I18N_KEYS.adminOperations;
export const ADMIN_PLATFORM_COPY = I18N_KEYS.adminPlatform;
