import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  RSVP_NOTE_VISIBILITY_LABEL_KEYS,
  RSVP_NOTE_VISIBILITY_OPTIONS,
  RSVP_OVERRIDE_REASON_OPTIONS,
  RSVP_OVERRIDE_STATUS_OPTIONS,
  RSVP_REASON_LABEL_KEYS,
  RSVP_STATUS_LABEL_KEYS,
} from '../constants/practice-rsvp-detail-copy.constants';
import { RSVP_OVERRIDE_REASON_MAX_LENGTH } from '../constants/practice-rsvp-detail.constants';
import type {
  RsvpFieldOption,
  RsvpOverridePanelView,
} from '../types/practice-rsvp-detail-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

const KEYS = I18N_KEYS.practiceRsvpDetail;

/** The draft an override form holds while a coach is filling it in. */
export interface RsvpOverrideDraft {
  readonly membershipId: string;
  readonly status: string;
  readonly reason: string;
  readonly reasonCategory: string;
  readonly note: string;
  readonly noteVisibility: string;
  readonly isSubmitting: boolean;
}

export interface RsvpOverrideDraftActions {
  readonly onStatusChange: (value: string) => void;
  readonly onReasonChange: (value: string) => void;
  readonly onReasonCategoryChange: (value: string) => void;
  readonly onNoteChange: (value: string) => void;
  readonly onNoteVisibilityChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly onCancel: () => void;
}

function buildStatusOptions(t: Translate): readonly RsvpFieldOption[] {
  return RSVP_OVERRIDE_STATUS_OPTIONS.map((status) => ({
    value: status,
    label: t(RSVP_STATUS_LABEL_KEYS[status]),
  }));
}

/** "None" first: a reason category is optional, unlike the reason text itself. */
function buildReasonCategoryOptions(t: Translate): readonly RsvpFieldOption[] {
  return [
    { value: '', label: t(KEYS.overrideReasonCategoryNone) },
    ...RSVP_OVERRIDE_REASON_OPTIONS.map((reason) => ({
      value: reason,
      label: t(RSVP_REASON_LABEL_KEYS[reason]),
    })),
  ];
}

function buildNoteVisibilityOptions(t: Translate): readonly RsvpFieldOption[] {
  return [
    { value: '', label: t(KEYS.overrideNoteVisibilityNone) },
    ...RSVP_NOTE_VISIBILITY_OPTIONS.map((visibility) => ({
      value: visibility,
      label: t(RSVP_NOTE_VISIBILITY_LABEL_KEYS[visibility]),
    })),
  ];
}

/**
 * Whether the draft is fit to submit. `reason` is the one field the wire
 * contract requires — an override with no reason is indistinguishable from a
 * coach overwriting someone's answer for no stated cause.
 */
export function canSubmitOverride(draft: RsvpOverrideDraft): boolean {
  const reason = draft.reason.trim();
  return (
    !draft.isSubmitting &&
    draft.status !== '' &&
    reason.length > 0 &&
    reason.length <= RSVP_OVERRIDE_REASON_MAX_LENGTH
  );
}

/** Translate one member's override form into the panel the screen renders. */
export function buildOverridePanelView(
  t: Translate,
  draft: RsvpOverrideDraft,
  actions: RsvpOverrideDraftActions,
): RsvpOverridePanelView {
  return {
    membershipId: draft.membershipId,
    headingLabel: t(KEYS.overrideHeading),
    statusLabel: t(KEYS.overrideStatusLabel),
    statusOptions: buildStatusOptions(t),
    status: draft.status,
    onStatusChange: actions.onStatusChange,
    reasonLabel: t(KEYS.overrideReasonLabel),
    reasonPlaceholder: t(KEYS.overrideReasonPlaceholder),
    reason: draft.reason,
    reasonValidationMessage:
      draft.reason.trim().length > RSVP_OVERRIDE_REASON_MAX_LENGTH
        ? t(KEYS.overrideReasonTooLong)
        : null,
    onReasonChange: actions.onReasonChange,
    reasonCategoryLabel: t(KEYS.overrideReasonCategoryLabel),
    reasonCategoryOptions: buildReasonCategoryOptions(t),
    reasonCategory: draft.reasonCategory,
    onReasonCategoryChange: actions.onReasonCategoryChange,
    noteLabel: t(KEYS.overrideNoteLabel),
    note: draft.note,
    onNoteChange: actions.onNoteChange,
    noteVisibilityLabel: t(KEYS.overrideNoteVisibilityLabel),
    noteVisibilityOptions: buildNoteVisibilityOptions(t),
    noteVisibility: draft.noteVisibility,
    onNoteVisibilityChange: actions.onNoteVisibilityChange,
    submitLabel: draft.isSubmitting ? t(KEYS.overrideSubmitting) : t(KEYS.overrideSubmit),
    cancelLabel: t(KEYS.overrideCancel),
    canSubmit: canSubmitOverride(draft),
    isSubmitting: draft.isSubmitting,
    onSubmit: actions.onSubmit,
    onCancel: actions.onCancel,
  };
}
