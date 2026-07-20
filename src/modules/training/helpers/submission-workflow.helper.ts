import { formatCairoDateTime } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';
import { I18N_KEYS } from '@/shared/i18n';

import { SUBMISSION_STATUS, type SubmissionStatus } from '../constants/training.constants';
import type { TrainingHistoryEntryView } from '../types/training-view.types';
import type { TrainingSubmission } from '../types/training.types';

type Translate = (key: string, params?: TranslateParams) => string;

export function canSubmitTraining(permissions: readonly string[]): boolean {
  return hasAllPermissions(permissions, [PERMISSIONS.activitySubmitSelf]);
}

export function canReadOwnTraining(permissions: readonly string[]): boolean {
  return hasAllPermissions(permissions, [PERMISSIONS.activityReadSelf]);
}

export function canReviewTraining(permissions: readonly string[]): boolean {
  return hasAllPermissions(permissions, [PERMISSIONS.activityReview]);
}

/** A draft or a changes-requested claim is the only editable shape. */
function isEditable(status: SubmissionStatus): boolean {
  return (
    status === SUBMISSION_STATUS.draft ||
    status === SUBMISSION_STATUS.changesRequested ||
    status === SUBMISSION_STATUS.withdrawn
  );
}

/** Submitting is the same call for a first submit and a resubmit. */
export function canSubmitForReview(status: SubmissionStatus): boolean {
  return isEditable(status);
}

/** Only a claim still in the queue can be pulled back out of it. */
export function canWithdraw(status: SubmissionStatus): boolean {
  return status === SUBMISSION_STATUS.submitted || status === SUBMISSION_STATUS.underReview;
}

/** The submit action reads "Resubmit" once a reviewer has asked for changes. */
export function submitActionKey(status: SubmissionStatus): string {
  return status === SUBMISSION_STATUS.changesRequested
    ? I18N_KEYS.training.actionResubmit
    : I18N_KEYS.training.actionSubmit;
}

/**
 * Derive the claim's timeline from the instants the record carries. The
 * backend owns the record; this only re-presents what it already stated, so
 * an absent instant simply produces no entry rather than an invented one.
 */
export function buildSubmissionHistory(
  t: Translate,
  locale: string,
  submission: TrainingSubmission | null,
): readonly TrainingHistoryEntryView[] {
  if (submission === null) {
    return [];
  }
  const entries: TrainingHistoryEntryView[] = [
    {
      key: 'created',
      label: t(I18N_KEYS.training.historyCreated),
      timeText: formatCairoDateTime(submission.createdAtIso, locale),
      tone: 'medium',
    },
  ];
  if (submission.submittedAtIso !== null) {
    entries.push({
      key: 'submitted',
      label: t(I18N_KEYS.training.historySubmitted),
      timeText: formatCairoDateTime(submission.submittedAtIso, locale),
      tone: 'primary',
    });
  }
  if (submission.withdrawnAtIso !== null) {
    entries.push({
      key: 'withdrawn',
      label: t(I18N_KEYS.training.historyWithdrawn),
      timeText: formatCairoDateTime(submission.withdrawnAtIso, locale),
      tone: 'medium',
    });
  }
  if (submission.status === SUBMISSION_STATUS.reversed) {
    entries.push({
      key: 'reversed',
      label: t(I18N_KEYS.training.historyReversed),
      timeText: formatCairoDateTime(submission.updatedAtIso, locale),
      tone: 'warning',
    });
  }
  return entries.reverse();
}
