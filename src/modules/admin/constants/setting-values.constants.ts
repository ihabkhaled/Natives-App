/**
 * Typed setting-value vocabulary (P2). Mirrors the backend's
 * `setting-values.constants.ts` so client-side validation and the OpenAPI
 * contract enforce the same bounds; the server re-validates regardless.
 */
export const ATTENDANCE_STATUS_CODES = [
  'present_on_time',
  'present_late',
  'excused',
  'injured',
  'absent',
  'remote_approved',
  'other_approved',
] as const;

export type AttendanceStatusCode = (typeof ATTENDANCE_STATUS_CODES)[number];

/** Both poles a usable attendance sheet needs, each required and active. */
export const REQUIRED_STATUS_POLES: readonly AttendanceStatusCode[] = ['present_on_time', 'absent'];

/**
 * Present-family codes for the absent-weight sanity rule: an absent weight
 * may never exceed any present-family weight (inverted weighting).
 */
export const PRESENT_FAMILY_STATUS_CODES: readonly AttendanceStatusCode[] = [
  'present_on_time',
  'present_late',
  'remote_approved',
  'other_approved',
];

export const SETTING_COLOR_TOKENS = [
  'primary',
  'success',
  'warning',
  'danger',
  'neutral',
  'accent1',
  'accent2',
  'accent3',
  'accent4',
] as const;

export type SettingColorToken = (typeof SETTING_COLOR_TOKENS)[number];

export const NOTIFICATION_EVENTS = [
  'practice_reminder',
  'practice_change',
  'attendance_finalized',
  'badge_awarded',
] as const;

export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number];

/** The one event whose rule carries a lead time. */
export const LEAD_HOURS_EVENT: NotificationEvent = 'practice_reminder';

export const NOTIFICATION_CHANNELS = ['push', 'email'] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_RECIPIENTS = ['members', 'staff', 'all'] as const;

export type NotificationRecipients = (typeof NOTIFICATION_RECIPIENTS)[number];

export const SETTING_VALUE_STATES = ['valid', 'legacy'] as const;

export type SettingValueState = (typeof SETTING_VALUE_STATES)[number];

// Identifier codes: lowercase snake, 2-32 chars, letter first (flat, ReDoS-safe).
export const SETTING_CODE_PATTERN = /^[a-z][a-z0-9_]{1,31}$/u;

// "HH:mm" 24-hour Cairo wall time; flat alternation, ReDoS-safe.
export const QUIET_HOURS_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/u;

export const ACCENT_COLOR_PATTERN = /^#[0-9a-f]{6}$/iu;

/** The accent the branding preview falls back to before one is chosen. */
export const DEFAULT_BRANDING_ACCENT = '#1B7F4D';

/** Backend message key answering a cancel of an already-in-effect version. */
export const SETTING_NOT_CANCELLABLE_MESSAGE_KEY = 'errors.teams.settingVersionNotCancellable';

// Deliberately simple, linear email shape check (mirrors the backend policy).
export const CONTACT_EMAIL_PATTERN = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/u;

// Strict UTC instant: explicit `Z`, optional 1-3 digit fraction (two flat
// alternatives keep every quantifier un-nested, mirroring the backend).
export const UTC_INSTANT_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$|^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{1,3}Z$/u;

/** Numeric bounds shared by every per-key schema and editor. */
export const SETTING_VALUE_BOUNDS = {
  labelMaxLength: 60,
  statusEntriesMax: 7,
  sessionTypesMax: 24,
  durationMinMinutes: 15,
  durationMaxMinutes: 480,
  /** Weights carry at most 3 decimals: value x 1000 must be an integer. */
  weightScale: 1000,
  weightEpsilon: 1e-9,
  scaleFloor: 0,
  scaleCeiling: 100,
  bandsMax: 10,
  tiersMax: 10,
  thresholdMax: 100_000,
  rosterMax: 100,
  /** Ultimate fields 7 a line - a squad below 7 cannot field a line. */
  matchSquadFloor: 7,
  leadHoursMin: 1,
  leadHoursMax: 168,
  displayNameMaxLength: 80,
  footerMaxLength: 200,
  emailMaxLength: 254,
  logoKeyMaxLength: 200,
  noteMaxLength: 512,
} as const;

/** Separator between a snapshot issue code and its subject. */
export const ISSUE_SUBJECT_SEPARATOR = ':';
