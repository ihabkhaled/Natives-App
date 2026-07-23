import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

export const ATTENDANCE_STATUS = {
  presentOnTime: 'present_on_time',
  presentLate: 'present_late',
  excused: 'excused',
  injured: 'injured',
  absent: 'absent',
  remoteApproved: 'remote_approved',
  otherApproved: 'other_approved',
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

export const ATTENDANCE_EXCUSE = {
  injury: 'injury',
  illness: 'illness',
  work: 'work',
  travel: 'travel',
  personal: 'personal',
  other: 'other',
} as const;

export type AttendanceExcuse = (typeof ATTENDANCE_EXCUSE)[keyof typeof ATTENDANCE_EXCUSE];

export const ATTENDANCE_SHEET_STATE = {
  open: 'open',
  finalized: 'finalized',
  corrected: 'corrected',
} as const;

export type AttendanceSheetState =
  (typeof ATTENDANCE_SHEET_STATE)[keyof typeof ATTENDANCE_SHEET_STATE];

export const ATTENDANCE_SOURCE = {
  self: 'self',
  coach: 'coach',
  admin: 'admin',
  import: 'import',
  system: 'system',
} as const;

export type AttendanceSource = (typeof ATTENDANCE_SOURCE)[keyof typeof ATTENDANCE_SOURCE];

/**
 * The server-ruled check-in eligibility states (`selfCheckIn.state` on the own
 * record read). The client renders these verbatim — it never re-implements the
 * window rule, and a missing block can only ever read as not-checkable.
 */
export const SELF_CHECK_IN_STATE = {
  notOpen: 'not_open',
  open: 'open',
  closed: 'closed',
  locked: 'locked',
  recorded: 'recorded',
} as const;

export type SelfCheckInState = (typeof SELF_CHECK_IN_STATE)[keyof typeof SELF_CHECK_IN_STATE];

/** RSVP context the roster read carries per row (contract 1.6.0, A6). */
export const ATTENDANCE_RSVP_STATUS = {
  going: 'going',
  notGoing: 'not_going',
  maybe: 'maybe',
  noResponse: 'no_response',
} as const;

export type AttendanceRsvpStatus =
  (typeof ATTENDANCE_RSVP_STATUS)[keyof typeof ATTENDANCE_RSVP_STATUS];

export const ATTENDANCE_QUEUE_STATE = {
  pending: 'pending',
  retrying: 'retrying',
  conflict: 'conflict',
  failed: 'failed',
} as const;

export type AttendanceQueueState =
  (typeof ATTENDANCE_QUEUE_STATE)[keyof typeof ATTENDANCE_QUEUE_STATE];

export const ATTENDANCE_STATUS_OPTIONS: readonly AttendanceStatus[] = [
  ATTENDANCE_STATUS.presentOnTime,
  ATTENDANCE_STATUS.presentLate,
  ATTENDANCE_STATUS.excused,
  ATTENDANCE_STATUS.injured,
  ATTENDANCE_STATUS.absent,
  ATTENDANCE_STATUS.remoteApproved,
  ATTENDANCE_STATUS.otherApproved,
];

export const ATTENDANCE_EXCUSE_OPTIONS: readonly AttendanceExcuse[] =
  Object.values(ATTENDANCE_EXCUSE);

export const ATTENDANCE_STATUS_LABEL_KEYS: Record<AttendanceStatus, I18nKey> = {
  [ATTENDANCE_STATUS.presentOnTime]: I18N_KEYS.attendance.statusPresent,
  [ATTENDANCE_STATUS.presentLate]: I18N_KEYS.attendance.statusLate,
  [ATTENDANCE_STATUS.excused]: I18N_KEYS.attendance.statusExcused,
  [ATTENDANCE_STATUS.injured]: I18N_KEYS.attendance.statusInjured,
  [ATTENDANCE_STATUS.absent]: I18N_KEYS.attendance.statusAbsent,
  [ATTENDANCE_STATUS.remoteApproved]: I18N_KEYS.attendance.statusRemote,
  [ATTENDANCE_STATUS.otherApproved]: I18N_KEYS.attendance.statusOtherApproved,
};

/** RSVP chip copy per status; a null server value reads as "no response". */
export const ATTENDANCE_RSVP_LABEL_KEYS: Record<AttendanceRsvpStatus, I18nKey> = {
  [ATTENDANCE_RSVP_STATUS.going]: I18N_KEYS.attendance.rsvpYes,
  [ATTENDANCE_RSVP_STATUS.notGoing]: I18N_KEYS.attendance.rsvpNo,
  [ATTENDANCE_RSVP_STATUS.maybe]: I18N_KEYS.attendance.rsvpMaybe,
  [ATTENDANCE_RSVP_STATUS.noResponse]: I18N_KEYS.attendance.rsvpNone,
};

/** Ionic colour tokens for the RSVP chips (gold stays reserved). */
export const ATTENDANCE_RSVP_TONES: Record<AttendanceRsvpStatus, string> = {
  [ATTENDANCE_RSVP_STATUS.going]: 'success',
  [ATTENDANCE_RSVP_STATUS.notGoing]: 'danger',
  [ATTENDANCE_RSVP_STATUS.maybe]: 'warning',
  [ATTENDANCE_RSVP_STATUS.noResponse]: 'medium',
};

export const ATTENDANCE_EXCUSE_LABEL_KEYS: Record<AttendanceExcuse, I18nKey> = {
  [ATTENDANCE_EXCUSE.injury]: I18N_KEYS.attendance.excuseInjury,
  [ATTENDANCE_EXCUSE.illness]: I18N_KEYS.attendance.excuseIllness,
  [ATTENDANCE_EXCUSE.work]: I18N_KEYS.attendance.excuseWork,
  [ATTENDANCE_EXCUSE.travel]: I18N_KEYS.attendance.excuseTravel,
  [ATTENDANCE_EXCUSE.personal]: I18N_KEYS.attendance.excusePersonal,
  [ATTENDANCE_EXCUSE.other]: I18N_KEYS.attendance.excuseOther,
};

export const ATTENDANCE_PAGE_SIZE = 100;
export const ATTENDANCE_QUEUE_LIMIT = 50;
export const ATTENDANCE_QUEUE_MAX_RETRIES = 3;
export const ATTENDANCE_LATE_MAX_MINUTES = 1440;

/**
 * Self-history window: one page per "load more" press, hard-stopped at the
 * contract's maximum limit (100) so the list can never become an unbounded
 * export of the member's record.
 */
export const ATTENDANCE_SELF_HISTORY_PAGE_SIZE = 20;
export const ATTENDANCE_SELF_HISTORY_MAX_ITEMS = 100;
