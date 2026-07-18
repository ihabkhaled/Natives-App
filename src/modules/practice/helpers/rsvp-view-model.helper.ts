import { formatCairoDateTime, isInstantInPast } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { TEST_IDS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import {
  PRACTICE_STATUS,
  RSVP_REASON_LABEL_KEYS,
  RSVP_REASON_OPTIONS,
  RSVP_STATUS,
  RSVP_STATUS_LABEL_KEYS,
  type RsvpStatus,
} from '../constants/practice.constants';
import { rsvpTone } from './practice-calendar-view-model.helper';
import type {
  RsvpControlData,
  RsvpOptionView,
  RsvpReasonOptionView,
} from '../types/practice-view.types';
import type { PracticeSessionDetail } from '../types/practice.types';

type Translate = (key: string, params?: TranslateParams) => string;

const OPTION_SPECS: readonly {
  readonly value: RsvpStatus;
  readonly color: string;
  readonly testId: string;
}[] = [
  { value: RSVP_STATUS.going, color: 'success', testId: TEST_IDS.rsvpGoingButton },
  { value: RSVP_STATUS.maybe, color: 'warning', testId: TEST_IDS.rsvpMaybeButton },
  { value: RSVP_STATUS.notGoing, color: 'danger', testId: TEST_IDS.rsvpNotGoingButton },
];

function buildOptions(t: Translate, current: RsvpStatus): readonly RsvpOptionView[] {
  return OPTION_SPECS.map((spec) => ({
    value: spec.value,
    label: t(RSVP_STATUS_LABEL_KEYS[spec.value]),
    color: spec.color,
    testId: spec.testId,
    isActive: spec.value === current,
  }));
}

function buildReasonOptions(t: Translate): readonly RsvpReasonOptionView[] {
  return RSVP_REASON_OPTIONS.map((value) => ({ value, label: t(RSVP_REASON_LABEL_KEYS[value]) }));
}

function buildDisabledExplanation(
  t: Translate,
  isCancelled: boolean,
  deadlinePassed: boolean,
  policyAllows: boolean,
): string | null {
  if (isCancelled) {
    return t(I18N_KEYS.practice.rsvpCancelledNotice);
  }
  if (deadlinePassed) {
    return t(I18N_KEYS.practice.rsvpDeadlinePassed);
  }
  if (!policyAllows) {
    return t(I18N_KEYS.practice.rsvpClosed);
  }
  return null;
}

function buildDeadlineLabel(
  t: Translate,
  locale: string,
  deadlineIso: string | null,
  deadlinePassed: boolean,
): string | null {
  if (deadlineIso === null || deadlinePassed) {
    return null;
  }
  return t(I18N_KEYS.practice.rsvpDeadlineLabel, {
    when: formatCairoDateTime(deadlineIso, locale),
  });
}

function buildWaitlistLabel(t: Translate, detail: PracticeSessionDetail): string | null {
  if (!detail.rsvp.waitlisted) {
    return null;
  }
  const position = detail.rsvp.waitlistPosition;
  return position === null
    ? t(I18N_KEYS.practice.waitlistNoticeNoPosition)
    : t(I18N_KEYS.practice.waitlistNotice, { position });
}

export interface RsvpControlDataParams {
  readonly t: Translate;
  readonly locale: string;
  readonly detail: PracticeSessionDetail;
  readonly nowIso: string;
  readonly canRsvpSelf: boolean;
}

/**
 * Pure RSVP control model. Combines the self-RSVP permission, the backend
 * policy (`canRespond`), the cutoff instant, and the session lifecycle into a
 * single "may I respond?" decision plus the explanation shown when responses
 * are closed.
 */
export function buildRsvpControlData(params: RsvpControlDataParams): RsvpControlData {
  const { t, locale, detail, nowIso, canRsvpSelf } = params;
  const deadlineIso = detail.rsvp.deadlineAtIso;
  const deadlinePassed = deadlineIso !== null && isInstantInPast(deadlineIso, nowIso);
  const isCancelled = detail.status === PRACTICE_STATUS.cancelled;
  const policyAllows = detail.rsvp.canRespond && canRsvpSelf;
  const canRespond = policyAllows && !deadlinePassed && !isCancelled;
  return {
    prompt: t(I18N_KEYS.practice.rsvpPrompt),
    yourResponseLabel: t(I18N_KEYS.practice.yourResponse),
    currentStatusLabel: t(RSVP_STATUS_LABEL_KEYS[detail.rsvp.status]),
    currentStatusTone: rsvpTone(detail.rsvp.status),
    options: buildOptions(t, detail.rsvp.status),
    reasonLabel: t(I18N_KEYS.practice.rsvpReasonLabel),
    reasonNoneLabel: t(I18N_KEYS.practice.reasonNone),
    reasonOptions: buildReasonOptions(t),
    showReason: canRespond,
    canRespond,
    disabledExplanation: buildDisabledExplanation(t, isCancelled, deadlinePassed, policyAllows),
    deadlineLabel: buildDeadlineLabel(t, locale, deadlineIso, deadlinePassed),
    waitlistLabel: buildWaitlistLabel(t, detail),
  };
}
