import { RSVP_REASON, RSVP_STATUS, type RsvpReason, type RsvpStatus } from '@/modules/practice';
import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

import { RSVP_NOTE_VISIBILITY, RSVP_SOURCE, type RsvpNoteVisibility, type RsvpSource } from './practice-rsvp-detail.constants';

/**
 * Status and reason labels point at `practice`'s existing copy
 * (`I18N_KEYS.practice.rsvp*` / `reason*`) rather than inventing a second
 * translation for "going" or "injury" — the practice module does not export
 * its own label maps, so the map is redeclared here, but the copy it resolves
 * to is the single one a member already sees on their own RSVP control.
 */
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

/** Who last set an RSVP: the member themself, or staff acting on their behalf. */
export const RSVP_SOURCE_LABEL_KEYS: Record<RsvpSource, I18nKey> = {
  [RSVP_SOURCE.self]: I18N_KEYS.practiceRsvpDetail.sourceSelf,
  [RSVP_SOURCE.coach]: I18N_KEYS.practiceRsvpDetail.sourceCoach,
  [RSVP_SOURCE.admin]: I18N_KEYS.practiceRsvpDetail.sourceAdmin,
  [RSVP_SOURCE.import]: I18N_KEYS.practiceRsvpDetail.sourceImport,
  [RSVP_SOURCE.system]: I18N_KEYS.practiceRsvpDetail.sourceSystem,
};

export const RSVP_NOTE_VISIBILITY_LABEL_KEYS: Record<RsvpNoteVisibility, I18nKey> = {
  [RSVP_NOTE_VISIBILITY.coaches]: I18N_KEYS.practiceRsvpDetail.noteVisibilityCoaches,
  [RSVP_NOTE_VISIBILITY.team]: I18N_KEYS.practiceRsvpDetail.noteVisibilityTeam,
};

/** Ionic colour tokens for the roster's status chip; never a raw hex value. */
export const RSVP_STATUS_TONE: Record<RsvpStatus, string> = {
  [RSVP_STATUS.going]: 'success',
  [RSVP_STATUS.maybe]: 'warning',
  [RSVP_STATUS.notGoing]: 'danger',
  [RSVP_STATUS.noResponse]: 'medium',
};

/** Status filter options, "all" first, reusing the practice module's own order. */
export const RSVP_STATUS_FILTER_OPTIONS: readonly RsvpStatus[] = [
  RSVP_STATUS.going,
  RSVP_STATUS.maybe,
  RSVP_STATUS.notGoing,
  RSVP_STATUS.noResponse,
];

/** Override status choices: every answer a coach may record on someone's behalf. */
export const RSVP_OVERRIDE_STATUS_OPTIONS: readonly RsvpStatus[] = [
  RSVP_STATUS.going,
  RSVP_STATUS.maybe,
  RSVP_STATUS.notGoing,
  RSVP_STATUS.noResponse,
];

/** Override reason-category choices; optional, so "none" is offered first. */
export const RSVP_OVERRIDE_REASON_OPTIONS: readonly RsvpReason[] = [
  RSVP_REASON.injury,
  RSVP_REASON.travel,
  RSVP_REASON.work,
  RSVP_REASON.personal,
  RSVP_REASON.other,
];

export const RSVP_NOTE_VISIBILITY_OPTIONS: readonly RsvpNoteVisibility[] = [
  RSVP_NOTE_VISIBILITY.coaches,
  RSVP_NOTE_VISIBILITY.team,
];
