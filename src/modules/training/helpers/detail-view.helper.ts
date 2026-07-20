import type { TranslateParams } from '@/packages/i18n';
import { TEST_IDS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import { SUBMISSION_STATUS } from '../constants/training.constants';
import type { TrainingDetailBody, TrainingWorkflowActionView } from '../types/training-view.types';
import type { ActivityType, TrainingSubmission } from '../types/training.types';
import {
  buildCandidateLabel,
  buildDurationLabel,
  buildStatusLabel,
  statusTone,
} from './submission-view.helper';
import { canSubmitForReview, canWithdraw, submitActionKey } from './submission-workflow.helper';

type Translate = (key: string, params?: TranslateParams) => string;

export interface DetailActionCallbacks {
  readonly onSubmit: () => void;
  readonly onWithdraw: () => void;
}

export interface DetailActionInput {
  readonly submission: TrainingSubmission | null;
  readonly canSubmit: boolean;
  readonly isBusy: boolean;
}

/**
 * The workflow actions the claim's current status allows. Submit doubles as
 * resubmit once a reviewer has asked for changes; withdraw only exists while
 * the claim is actually sitting in the queue.
 */
export function buildDetailActions(
  t: Translate,
  input: DetailActionInput,
  callbacks: DetailActionCallbacks,
): readonly TrainingWorkflowActionView[] {
  const { submission } = input;
  if (submission === null || !input.canSubmit) {
    return [];
  }
  const actions: TrainingWorkflowActionView[] = [];
  if (canSubmitForReview(submission.status)) {
    actions.push({
      key: 'submit',
      label: t(submitActionKey(submission.status)),
      testId: TEST_IDS.trainingSubmitAction,
      tone: 'primary',
      isBusy: input.isBusy,
      onSelect: callbacks.onSubmit,
    });
  }
  if (canWithdraw(submission.status)) {
    actions.push({
      key: 'withdraw',
      label: t(I18N_KEYS.training.actionWithdraw),
      testId: TEST_IDS.trainingWithdrawAction,
      tone: 'secondary',
      isBusy: input.isBusy,
      onSelect: callbacks.onWithdraw,
    });
  }
  return actions;
}

interface DetailFacts {
  readonly typeName: string;
  readonly dateLabel: string;
  readonly durationMinutes: number | null;
  readonly notes: string | null;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly isChangesRequested: boolean;
}

const MISSING_FACTS: DetailFacts = {
  typeName: '',
  dateLabel: '',
  durationMinutes: null,
  notes: null,
  statusLabel: '',
  statusTone: 'medium',
  isChangesRequested: false,
};

function readFacts(
  t: Translate,
  submission: TrainingSubmission | null,
  activityType: ActivityType | null,
): DetailFacts {
  if (submission === null) {
    return MISSING_FACTS;
  }
  return {
    typeName: activityType === null ? submission.activityTypeId : activityType.name,
    dateLabel: submission.performedOn,
    durationMinutes: submission.durationMinutes,
    notes: submission.notes,
    statusLabel: buildStatusLabel(t, submission.status),
    statusTone: statusTone(submission.status),
    isChangesRequested: submission.status === SUBMISSION_STATUS.changesRequested,
  };
}

/** The claim's own facts, translated. A missing claim yields empty copy. */
export function buildDetailBody(
  t: Translate,
  submission: TrainingSubmission | null,
  activityType: ActivityType | null,
): TrainingDetailBody {
  const facts = readFacts(t, submission, activityType);
  return {
    typeName: facts.typeName,
    dateLabel: facts.dateLabel,
    durationLabel: buildDurationLabel(t, facts.durationMinutes),
    notes: facts.notes,
    statusLabel: facts.statusLabel,
    statusTone: facts.statusTone,
    candidateLabel: buildCandidateLabel(t, activityType),
    candidateNotice: t(I18N_KEYS.training.candidateNotice),
    changesBanner: facts.isChangesRequested ? t(I18N_KEYS.training.changesRequestedBanner) : null,
  };
}
