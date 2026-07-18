import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

/**
 * Practice-domain vocabularies as `as const` maps (TypeScript enums are
 * banned). Wire values mirror the backend contract from prompts 200/201; the
 * client owns the i18n key each value renders through, so raw backend copy is
 * never displayed.
 */
export const PRACTICE_TYPE = {
  practice: 'practice',
  fitness: 'fitness',
  scrimmage: 'scrimmage',
  game: 'game',
  throwing: 'throwing',
  running: 'running',
  gym: 'gym',
  rules: 'rules',
  custom: 'custom',
} as const;

export type PracticeType = (typeof PRACTICE_TYPE)[keyof typeof PRACTICE_TYPE];

export const PRACTICE_STATUS = {
  scheduled: 'scheduled',
  rescheduled: 'rescheduled',
  cancelled: 'cancelled',
} as const;

export type PracticeStatus = (typeof PRACTICE_STATUS)[keyof typeof PRACTICE_STATUS];

export const RSVP_STATUS = {
  going: 'going',
  notGoing: 'not_going',
  maybe: 'maybe',
  noResponse: 'no_response',
} as const;

export type RsvpStatus = (typeof RSVP_STATUS)[keyof typeof RSVP_STATUS];

export const RSVP_REASON = {
  injury: 'injury',
  travel: 'travel',
  work: 'work',
  personal: 'personal',
  other: 'other',
} as const;

export type RsvpReason = (typeof RSVP_REASON)[keyof typeof RSVP_REASON];

export const PRACTICE_CHANGE_KIND = {
  rescheduled: 'rescheduled',
  venueChanged: 'venue_changed',
  cancelled: 'cancelled',
} as const;

export type PracticeChangeKind = (typeof PRACTICE_CHANGE_KIND)[keyof typeof PRACTICE_CHANGE_KIND];

/** Date window a member is browsing; drives the default query scope. */
export const PRACTICE_SCOPE = {
  upcoming: 'upcoming',
  all: 'all',
  past: 'past',
} as const;

export type PracticeScope = (typeof PRACTICE_SCOPE)[keyof typeof PRACTICE_SCOPE];

export const PRACTICE_TYPE_LABEL_KEYS: Record<PracticeType, I18nKey> = {
  [PRACTICE_TYPE.practice]: I18N_KEYS.practice.typePractice,
  [PRACTICE_TYPE.fitness]: I18N_KEYS.practice.typeFitness,
  [PRACTICE_TYPE.scrimmage]: I18N_KEYS.practice.typeScrimmage,
  [PRACTICE_TYPE.game]: I18N_KEYS.practice.typeGame,
  [PRACTICE_TYPE.throwing]: I18N_KEYS.practice.typeThrowing,
  [PRACTICE_TYPE.running]: I18N_KEYS.practice.typeRunning,
  [PRACTICE_TYPE.gym]: I18N_KEYS.practice.typeGym,
  [PRACTICE_TYPE.rules]: I18N_KEYS.practice.typeRules,
  [PRACTICE_TYPE.custom]: I18N_KEYS.practice.typeCustom,
};

export const PRACTICE_STATUS_LABEL_KEYS: Record<PracticeStatus, I18nKey> = {
  [PRACTICE_STATUS.scheduled]: I18N_KEYS.practice.statusScheduled,
  [PRACTICE_STATUS.rescheduled]: I18N_KEYS.practice.statusRescheduled,
  [PRACTICE_STATUS.cancelled]: I18N_KEYS.practice.statusCancelled,
};

export const RSVP_STATUS_LABEL_KEYS: Record<RsvpStatus, I18nKey> = {
  [RSVP_STATUS.going]: I18N_KEYS.practice.rsvpGoing,
  [RSVP_STATUS.maybe]: I18N_KEYS.practice.rsvpMaybe,
  [RSVP_STATUS.notGoing]: I18N_KEYS.practice.rsvpNotGoing,
  [RSVP_STATUS.noResponse]: I18N_KEYS.practice.rsvpNoResponse,
};

export const RSVP_REASON_LABEL_KEYS: Record<RsvpReason, I18nKey> = {
  [RSVP_REASON.injury]: I18N_KEYS.practice.reasonInjury,
  [RSVP_REASON.travel]: I18N_KEYS.practice.reasonTravel,
  [RSVP_REASON.work]: I18N_KEYS.practice.reasonWork,
  [RSVP_REASON.personal]: I18N_KEYS.practice.reasonPersonal,
  [RSVP_REASON.other]: I18N_KEYS.practice.reasonOther,
};

export const PRACTICE_CHANGE_LABEL_KEYS: Record<PracticeChangeKind, I18nKey> = {
  [PRACTICE_CHANGE_KIND.rescheduled]: I18N_KEYS.practice.changeRescheduled,
  [PRACTICE_CHANGE_KIND.venueChanged]: I18N_KEYS.practice.changeVenue,
  [PRACTICE_CHANGE_KIND.cancelled]: I18N_KEYS.practice.changeCancelled,
};

export const PRACTICE_SCOPE_LABEL_KEYS: Record<PracticeScope, I18nKey> = {
  [PRACTICE_SCOPE.upcoming]: I18N_KEYS.practice.scopeUpcoming,
  [PRACTICE_SCOPE.all]: I18N_KEYS.practice.scopeAll,
  [PRACTICE_SCOPE.past]: I18N_KEYS.practice.scopePast,
};

/** Ordered scope segments for the calendar filter bar. */
export const PRACTICE_SCOPE_OPTIONS: readonly PracticeScope[] = [
  PRACTICE_SCOPE.upcoming,
  PRACTICE_SCOPE.all,
  PRACTICE_SCOPE.past,
];

/** Ordered type options for the calendar filter (custom last). */
export const PRACTICE_TYPE_OPTIONS: readonly PracticeType[] = [
  PRACTICE_TYPE.practice,
  PRACTICE_TYPE.fitness,
  PRACTICE_TYPE.scrimmage,
  PRACTICE_TYPE.game,
  PRACTICE_TYPE.throwing,
  PRACTICE_TYPE.running,
  PRACTICE_TYPE.gym,
  PRACTICE_TYPE.rules,
  PRACTICE_TYPE.custom,
];

/** RSVP responses a member may filter their sessions by. */
export const RSVP_FILTER_OPTIONS: readonly RsvpStatus[] = [
  RSVP_STATUS.going,
  RSVP_STATUS.maybe,
  RSVP_STATUS.notGoing,
  RSVP_STATUS.noResponse,
];

/** Reason categories offered when declining or answering "maybe". */
export const RSVP_REASON_OPTIONS: readonly RsvpReason[] = [
  RSVP_REASON.injury,
  RSVP_REASON.travel,
  RSVP_REASON.work,
  RSVP_REASON.personal,
  RSVP_REASON.other,
];

/** Bounded first-page window; the list can grow by this step (never unbounded). */
export const PRACTICE_PAGE_SIZE = 20;
export const PRACTICE_MAX_PAGE_SIZE = 100;
