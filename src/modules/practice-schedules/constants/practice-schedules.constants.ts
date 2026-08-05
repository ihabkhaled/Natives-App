import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

/**
 * Practice-schedule vocabularies as `as const` maps (TypeScript enums are
 * banned). Wire values mirror `CreateScheduleDto`/`ScheduleResponseDto`; the
 * client owns the i18n key each value renders through, so raw backend copy is
 * never displayed.
 */
export const SCHEDULE_FREQUENCY = {
  weekly: 'weekly',
  oneOff: 'one_off',
} as const;

export type ScheduleFrequency = (typeof SCHEDULE_FREQUENCY)[keyof typeof SCHEDULE_FREQUENCY];

export const SCHEDULE_VISIBILITY = {
  team: 'team',
  coaches: 'coaches',
  public: 'public',
} as const;

export type ScheduleVisibility = (typeof SCHEDULE_VISIBILITY)[keyof typeof SCHEDULE_VISIBILITY];

/**
 * `active` is the only status this module ever writes. `archived` is a read
 * outcome of the archive endpoint, never a value chosen from a form — there is
 * no "reactivate" flow, so the union stays honest about what the client does.
 */
export const SCHEDULE_STATUS = {
  active: 'active',
  archived: 'archived',
} as const;

export type ScheduleStatus = (typeof SCHEDULE_STATUS)[keyof typeof SCHEDULE_STATUS];

export const SCHEDULE_FREQUENCY_OPTIONS: readonly ScheduleFrequency[] = [
  SCHEDULE_FREQUENCY.weekly,
  SCHEDULE_FREQUENCY.oneOff,
];

export const SCHEDULE_VISIBILITY_OPTIONS: readonly ScheduleVisibility[] = [
  SCHEDULE_VISIBILITY.team,
  SCHEDULE_VISIBILITY.coaches,
  SCHEDULE_VISIBILITY.public,
];

export const SCHEDULE_FREQUENCY_LABEL_KEYS: Record<ScheduleFrequency, I18nKey> = {
  [SCHEDULE_FREQUENCY.weekly]: I18N_KEYS.practiceSchedules.frequencyWeekly,
  [SCHEDULE_FREQUENCY.oneOff]: I18N_KEYS.practiceSchedules.frequencyOneOff,
};

export const SCHEDULE_VISIBILITY_LABEL_KEYS: Record<ScheduleVisibility, I18nKey> = {
  [SCHEDULE_VISIBILITY.team]: I18N_KEYS.practiceSchedules.visibilityTeam,
  [SCHEDULE_VISIBILITY.coaches]: I18N_KEYS.practiceSchedules.visibilityCoaches,
  [SCHEDULE_VISIBILITY.public]: I18N_KEYS.practiceSchedules.visibilityPublic,
};

export const SCHEDULE_STATUS_LABEL_KEYS: Record<ScheduleStatus, I18nKey> = {
  [SCHEDULE_STATUS.active]: I18N_KEYS.practiceSchedules.statusActive,
  [SCHEDULE_STATUS.archived]: I18N_KEYS.practiceSchedules.statusArchived,
};

/** `Date#getDay()` numbering (0 = Sunday … 6 = Saturday), the wire convention. */
export const SCHEDULE_WEEKDAYS: readonly number[] = [0, 1, 2, 3, 4, 5, 6];

export const SCHEDULE_WEEKDAY_LABEL_KEYS: Record<number, I18nKey> = {
  0: I18N_KEYS.practiceSchedules.weekdaySun,
  1: I18N_KEYS.practiceSchedules.weekdayMon,
  2: I18N_KEYS.practiceSchedules.weekdayTue,
  3: I18N_KEYS.practiceSchedules.weekdayWed,
  4: I18N_KEYS.practiceSchedules.weekdayThu,
  5: I18N_KEYS.practiceSchedules.weekdayFri,
  6: I18N_KEYS.practiceSchedules.weekdaySat,
};

/** Default pattern offered to a coach starting a new schedule from scratch. */
export const DEFAULT_SCHEDULE_TIMEZONE = 'Africa/Cairo';

export const SCHEDULE_FIELD_LIMITS = {
  nameMax: 120,
  sessionTypeMax: 64,
  timezoneMax: 64,
  notesMax: 2000,
  durationMax: 1440,
  intervalWeeksMax: 8,
  capacityMax: 10000,
} as const;
