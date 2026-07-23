import { I18N_KEYS } from '@/shared/i18n';

import type {
  AttendanceStatusCode,
  NotificationEvent,
  NotificationRecipients,
  SettingColorToken,
} from './setting-values.constants';

export const STATUS_CODE_LABEL_KEYS: Record<AttendanceStatusCode, string> = {
  present_on_time: I18N_KEYS.settingEditors.statusPresentOnTime,
  present_late: I18N_KEYS.settingEditors.statusPresentLate,
  excused: I18N_KEYS.settingEditors.statusExcused,
  injured: I18N_KEYS.settingEditors.statusInjured,
  absent: I18N_KEYS.settingEditors.statusAbsent,
  remote_approved: I18N_KEYS.settingEditors.statusRemoteApproved,
  other_approved: I18N_KEYS.settingEditors.statusOtherApproved,
};

export const COLOR_TOKEN_LABEL_KEYS: Record<SettingColorToken, string> = {
  primary: I18N_KEYS.settingEditors.colorPrimary,
  success: I18N_KEYS.settingEditors.colorSuccess,
  warning: I18N_KEYS.settingEditors.colorWarning,
  danger: I18N_KEYS.settingEditors.colorDanger,
  neutral: I18N_KEYS.settingEditors.colorNeutral,
  accent1: I18N_KEYS.settingEditors.colorAccent1,
  accent2: I18N_KEYS.settingEditors.colorAccent2,
  accent3: I18N_KEYS.settingEditors.colorAccent3,
  accent4: I18N_KEYS.settingEditors.colorAccent4,
};

export const NOTIFICATION_EVENT_LABEL_KEYS: Record<NotificationEvent, string> = {
  practice_reminder: I18N_KEYS.settingEditors.eventPracticeReminder,
  practice_change: I18N_KEYS.settingEditors.eventPracticeChange,
  attendance_finalized: I18N_KEYS.settingEditors.eventAttendanceFinalized,
  badge_awarded: I18N_KEYS.settingEditors.eventBadgeAwarded,
};

export const RECIPIENT_LABEL_KEYS: Record<NotificationRecipients, string> = {
  members: I18N_KEYS.settingEditors.recipientsMembers,
  staff: I18N_KEYS.settingEditors.recipientsStaff,
  all: I18N_KEYS.settingEditors.recipientsAll,
};

/**
 * Constraint-code vocabulary shared with backend 400s and snapshot issues:
 * every machine code the schemas or the server can emit maps to copy.
 */
export const CONSTRAINT_LABEL_KEYS: Record<string, string> = {
  duplicate_code: I18N_KEYS.settingConstraints.duplicateCode,
  missing_pole: I18N_KEYS.settingConstraints.missingPole,
  no_metric_status: I18N_KEYS.settingConstraints.noMetricStatus,
  no_active_entry: I18N_KEYS.settingConstraints.noActiveEntry,
  too_few_entries: I18N_KEYS.settingConstraints.tooFewEntries,
  too_many_entries: I18N_KEYS.settingConstraints.tooManyEntries,
  out_of_range: I18N_KEYS.settingConstraints.outOfRange,
  too_many_decimals: I18N_KEYS.settingConstraints.tooManyDecimals,
  min_not_below_max: I18N_KEYS.settingConstraints.minNotBelowMax,
  step_not_divisor: I18N_KEYS.settingConstraints.stepNotDivisor,
  band_outside_scale: I18N_KEYS.settingConstraints.bandOutsideScale,
  band_overlap: I18N_KEYS.settingConstraints.bandOverlap,
  threshold_not_ascending: I18N_KEYS.settingConstraints.thresholdNotAscending,
  squad_exceeds_roster: I18N_KEYS.settingConstraints.squadExceedsRoster,
  squad_below_line: I18N_KEYS.settingConstraints.squadBelowLine,
  position_cap_below_squad_min: I18N_KEYS.settingConstraints.positionCapBelowSquadMin,
  duplicate_event: I18N_KEYS.settingConstraints.duplicateEvent,
  no_channel: I18N_KEYS.settingConstraints.noChannel,
  duplicate_channel: I18N_KEYS.settingConstraints.duplicateChannel,
  lead_hours_required: I18N_KEYS.settingConstraints.leadHoursRequired,
  lead_hours_forbidden: I18N_KEYS.settingConstraints.leadHoursForbidden,
  quiet_hours_equal: I18N_KEYS.settingConstraints.quietHoursEqual,
  invalid_time: I18N_KEYS.settingConstraints.invalidTime,
  blank_text: I18N_KEYS.settingConstraints.blankText,
  invalid_accent_color: I18N_KEYS.settingConstraints.invalidAccentColor,
  invalid_email: I18N_KEYS.settingConstraints.invalidEmail,
  invalid_code: I18N_KEYS.settingConstraints.invalidCode,
  invalid_label: I18N_KEYS.settingConstraints.invalidLabel,
  statuses_not_configured: I18N_KEYS.settingConstraints.statusesNotConfigured,
  absent_weight_exceeds_present: I18N_KEYS.settingConstraints.absentWeightExceedsPresent,
};

/** Subject-carrying issue codes (`weights_missing_status:<code>`). */
export const SUBJECT_CONSTRAINT_LABEL_KEYS: Record<string, string> = {
  weights_missing_status: I18N_KEYS.settingConstraints.weightsMissingStatus,
  weights_unknown_status: I18N_KEYS.settingConstraints.weightsUnknownStatus,
  unknown_position: I18N_KEYS.settingConstraints.unknownPosition,
};

/** Fallback for schema type errors and unknown constraint codes. */
export const CONSTRAINT_FALLBACK_KEY = I18N_KEYS.settingConstraints.invalidValue;
