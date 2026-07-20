import type { TranslateParams } from '@/packages/i18n';
import { TEST_IDS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import { REVIEW_DECISION, type ReviewDecision } from '../constants/training.constants';
import type {
  ReviewDecisionActionView,
  ReviewDetailPanelView,
  ReviewQueueItemView,
} from '../types/training-view.types';
import type { ReviewSubmission, ReviewSubmissionDetail } from '../types/training.types';
import {
  buildDurationLabel,
  buildSignalViews,
  buildStatusLabel,
  statusTone,
} from './submission-view.helper';

type Translate = (key: string, params?: TranslateParams) => string;

/** Approve may carry an optional note; the other two always require one. */
export function decisionRequiresNote(decision: ReviewDecision): boolean {
  return decision !== REVIEW_DECISION.approve;
}

const DECISION_SPECS: readonly {
  readonly decision: ReviewDecision;
  readonly labelKey: string;
  readonly testId: string;
  readonly tone: string;
}[] = [
  {
    decision: REVIEW_DECISION.approve,
    labelKey: I18N_KEYS.training.reviewApprove,
    testId: TEST_IDS.trainingReviewApprove,
    tone: 'primary',
  },
  {
    decision: REVIEW_DECISION.requestChanges,
    labelKey: I18N_KEYS.training.reviewRequestChanges,
    testId: TEST_IDS.trainingReviewRequestChanges,
    tone: 'secondary',
  },
  {
    decision: REVIEW_DECISION.reject,
    labelKey: I18N_KEYS.training.reviewReject,
    testId: TEST_IDS.trainingReviewReject,
    tone: 'danger',
  },
];

/** Build the three decision buttons, or none at all for a self-review. */
export function buildDecisionActions(
  t: Translate,
  isBusy: boolean,
  onSelect: (decision: ReviewDecision) => void,
): readonly ReviewDecisionActionView[] {
  return DECISION_SPECS.map((spec) => ({
    decision: spec.decision,
    label: t(spec.labelKey),
    testId: spec.testId,
    tone: spec.tone,
    isBusy,
    onSelect: () => {
      onSelect(spec.decision);
    },
  }));
}

export interface ReviewPanelInput {
  readonly detail: ReviewSubmissionDetail;
  readonly typeNames: ReadonlyMap<string, string>;
  readonly noteValue: string;
  readonly noteError: string | null;
  readonly isSelfReview: boolean;
  readonly actions: readonly ReviewDecisionActionView[];
  readonly onNoteChange: (value: string) => void;
}

/**
 * The selected claim's review panel. Signals are advisory observations, and a
 * self-review presents a plain statement instead of disabled controls.
 */
export function buildReviewPanel(t: Translate, input: ReviewPanelInput): ReviewDetailPanelView {
  const { submission } = input.detail;
  return {
    typeName: input.typeNames.get(submission.activityTypeId) ?? submission.activityTypeId,
    dateLabel: submission.performedOn,
    durationLabel: buildDurationLabel(t, submission.durationMinutes),
    notes: submission.notes,
    statusLabel: buildStatusLabel(t, submission.status),
    statusTone: statusTone(submission.status),
    evidenceLabel: t(I18N_KEYS.training.evidenceCount, { count: input.detail.evidenceCount }),
    buddyLabel: t(I18N_KEYS.training.buddiesHeading),
    signalsHeading: t(I18N_KEYS.training.signalsHeading),
    signalsIntro: t(I18N_KEYS.training.signalsIntro),
    signalsNoneLabel: t(I18N_KEYS.training.signalsNone),
    signals: buildSignalViews(t, input.detail.signals),
    decisionHeading: t(I18N_KEYS.training.reviewDecisionHeading),
    noteLabel: t(I18N_KEYS.training.reviewNoteLabel),
    notePlaceholder: t(I18N_KEYS.training.reviewNotePlaceholder),
    noteValue: input.noteValue,
    noteError: input.noteError,
    selfBlockedNotice: input.isSelfReview ? t(I18N_KEYS.training.reviewSelfBlocked) : null,
    actions: input.isSelfReview ? [] : input.actions,
    onNoteChange: input.onNoteChange,
  };
}

/** One bounded queue row; the reviewer opens it to see the full claim. */
export function buildQueueItems(
  t: Translate,
  items: readonly ReviewSubmission[],
  typeNames: ReadonlyMap<string, string>,
  selectedId: string,
): readonly ReviewQueueItemView[] {
  return items.map((item) => ({
    id: item.id,
    typeName: typeNames.get(item.activityTypeId) ?? item.activityTypeId,
    dateLabel: item.performedOn,
    statusLabel: buildStatusLabel(t, item.status),
    statusTone: statusTone(item.status),
    evidenceLabel: t(I18N_KEYS.training.queueOpen),
    isSelected: item.id === selectedId,
    openLabel: t(I18N_KEYS.training.queueOpen),
  }));
}
