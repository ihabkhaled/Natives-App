import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { ALL_STATUS_FILTER } from '../constants/training-form.constants';
import {
  REVIEW_QUEUE_STATUSES,
  SUBMISSION_LIMITS,
  type ReviewDecision,
} from '../constants/training.constants';
import {
  buildDecisionActions,
  buildQueueItems,
  buildReviewPanel,
  decisionRequiresNote,
} from '../helpers/review-panel.helper';
import { buildTypeNameMap, readActivityTypes, readPage } from '../helpers/collection.helper';
import { resolveTrainingScreenStatus } from '../helpers/screen-status.helper';
import { buildStatusOptions } from '../helpers/submission-view.helper';
import { buildTrainingScreenCopy } from '../helpers/training-copy.helper';
import { useReviewDecisionMutation } from '../mutations/use-review-decision-mutation.hook';
import type { TrainingReviewView } from '../types/training-view.types';
import type { ReviewSubmissionDetail } from '../types/training.types';
import { useActivityTypesQuery } from './use-activity-types-query.hook';
import { useReviewDetailQuery } from './use-review-detail-query.hook';
import { useReviewQueueQuery } from './use-review-queue-query.hook';
import { useTrainingContext } from './use-training-context.hook';

/**
 * Prepared, translated view model for the reviewer queue: the bounded list,
 * the selected claim with its advisory signals, and the three decisions. Self
 * review is blocked in the UI; the backend refuses it regardless.
 */
export function useTrainingReview(): TrainingReviewView {
  const { t } = useAppTranslation();
  const context = useTrainingContext();
  const toast = useAppToast();
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUS_FILTER);
  const [selectedId, setSelectedId] = useState('');
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);

  const queue = useReviewQueueQuery(
    context.teamId,
    statusFilter === ALL_STATUS_FILTER ? null : statusFilter,
  );
  const catalog = useActivityTypesQuery(context.teamId);
  const detail = useReviewDetailQuery(context.teamId, selectedId);

  const decide = useReviewDecisionMutation(context.teamId, {
    onSuccess: () => {
      setNote('');
      setNoteError(null);
      void toast.showToast({ message: t(I18N_KEYS.training.reviewDecidedToast), tone: 'success' });
    },
    onError: () => {
      void toast.showToast({ message: t(I18N_KEYS.training.actionFailedToast), tone: 'danger' });
    },
  });

  const typeNames = buildTypeNameMap(readActivityTypes(catalog.data));
  const page = readPage(queue.data);
  const selected = detail.data ?? null;
  const isSelfReview = selected?.submission.membershipId === context.membershipId;

  /**
   * Record one decision. Only reachable from a selected, non-self claim: the
   * panel drops its actions entirely on a self review, and the backend refuses
   * the call regardless.
   */
  function submitDecision(claim: ReviewSubmissionDetail, decision: ReviewDecision): void {
    const trimmed = note.trim();
    if (decisionRequiresNote(decision) && trimmed === '') {
      setNoteError(t(I18N_KEYS.training.reviewNoteRequired));
      return;
    }
    setNoteError(null);
    decide.run({
      submissionId: claim.submission.id,
      decision,
      reviewNote: trimmed === '' ? null : trimmed.slice(0, SUBMISSION_LIMITS.maxReviewNoteLength),
      expectedRecordVersion: claim.submission.recordVersion,
    });
  }

  return {
    ...buildTrainingScreenCopy(t, {
      error: queue.error,
      isOffline: context.isOffline,
      onRetry: queue.refetch,
      emptyTitleKey: I18N_KEYS.training.queueEmptyTitle,
      emptyMessageKey: I18N_KEYS.training.queueEmptyMessage,
    }),
    title: t(I18N_KEYS.training.reviewTitle),
    subtitle: t(I18N_KEYS.training.reviewSubtitle),
    status: resolveTrainingScreenStatus(context, queue, context.canReview, page.items.length > 0),
    queueHeading: t(I18N_KEYS.training.queueHeading),
    queueCountLabel: t(I18N_KEYS.training.queueCount, {
      shown: page.items.length,
      total: page.total,
    }),
    statusFilterLabel: t(I18N_KEYS.training.queueStatusFilter),
    statusFilter,
    statusOptions: buildStatusOptions(t, REVIEW_QUEUE_STATUSES, I18N_KEYS.training.queueFilterAll),
    items: buildQueueItems(t, page.items, typeNames, selectedId),
    selectPrompt: t(I18N_KEYS.training.queueSelectPrompt),
    detail:
      selected === null
        ? null
        : buildReviewPanel(t, {
            detail: selected,
            typeNames,
            noteValue: note,
            noteError,
            isSelfReview,
            actions: buildDecisionActions(t, decide.isRunning, (decision) => {
              submitDecision(selected, decision);
            }),
            onNoteChange: setNote,
          }),
    onStatusFilterChange: (value: string) => {
      setStatusFilter(value);
      setSelectedId('');
    },
    onSelect: (submissionId: string) => {
      setSelectedId(submissionId);
      setNote('');
      setNoteError(null);
    },
  };
}
