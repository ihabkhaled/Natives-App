import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useConfirmAlert } from '@/shared/ui';

import type { AttendanceScreenActions } from '../types/attendance-view.types';
import { useBulkAttendanceMutation } from '../mutations/use-bulk-attendance-mutation.hook';
import { useCorrectAttendanceMutation } from '../mutations/use-correct-attendance-mutation.hook';
import { useFinalizeAttendanceMutation } from '../mutations/use-finalize-attendance-mutation.hook';
import type { AttendanceQueueReplayView } from './use-attendance-queue-replay.hook';
import type { AttendanceEditorView } from './use-attendance-editor.hook';
import { useAttendanceNotices } from './use-attendance-notices.hook';
import type { AttendanceSheet } from '../types/attendance.types';

export interface AttendanceActionsView {
  readonly actions: AttendanceScreenActions;
  readonly isSubmitting: boolean;
  readonly isFinalizing: boolean;
  readonly isCorrecting: boolean;
  readonly historyMembershipId: string;
}

interface AttendanceActionsParams {
  readonly teamId: string;
  readonly sessionId: string;
  readonly isOnline: boolean;
  readonly sheet: AttendanceSheet | undefined;
  readonly editor: AttendanceEditorView;
  readonly queue: AttendanceQueueReplayView;
  readonly onRefetch: () => void;
}

export function useAttendanceActions(params: AttendanceActionsParams): AttendanceActionsView {
  const { t } = useAppTranslation();
  const alert = useConfirmAlert();
  const notices = useAttendanceNotices();
  const [historyMembershipId, setHistoryMembershipId] = useState('');
  const bulk = useBulkAttendanceMutation(params.teamId, params.sessionId, params.isOnline, {
    onSaved: (count) => {
      params.editor.acceptChanges();
      notices.saved(count);
    },
    onQueued: (count) => {
      params.editor.acceptChanges();
      notices.queued(count);
    },
    onError: notices.failed,
  });
  const finalization = useFinalizeAttendanceMutation(params.teamId, params.sessionId, {
    onSuccess: notices.finalized,
    onError: notices.failed,
  });
  const correction = useCorrectAttendanceMutation(params.teamId, params.sessionId, {
    onSuccess: () => {
      params.editor.acceptChanges();
      notices.corrected();
    },
    onError: notices.failed,
  });

  return {
    actions: {
      onRetry: params.onRefetch,
      onSubmit: () => {
        const marks = params.editor.buildMarks();
        if (marks.length > 0) {
          bulk.submit(marks);
        }
      },
      onFinalize: () => {
        const version = params.sheet?.version;
        if (version === null || version === undefined) {
          return;
        }
        void alert
          .confirm({
            header: t(I18N_KEYS.attendance.finalizeTitle),
            message: t(I18N_KEYS.attendance.finalizeMessage),
            cancelLabel: t(I18N_KEYS.attendance.cancel),
            confirmLabel: t(I18N_KEYS.attendance.confirm),
          })
          .then((confirmed) => {
            if (confirmed) {
              finalization.finalize(version);
            }
          });
      },
      onRetryQueue: params.queue.retryFailed,
      onResolveConflict: params.queue.resolveConflict,
      onShowHistory: setHistoryMembershipId,
      onSaveCorrection: (membershipId) => {
        const draft = params.editor.drafts[membershipId];
        if (draft?.status === null || draft === undefined || draft.correctionReason.trim() === '') {
          return;
        }
        correction.correct({
          membershipId,
          status: draft.status,
          latenessMinutes: draft.latenessMinutes,
          excuseCategory: draft.excuseCategory,
          expectedVersion: draft.expectedVersion,
          reason: draft.correctionReason.trim(),
        });
      },
    },
    isSubmitting: bulk.isSubmitting,
    isFinalizing: finalization.isSubmitting,
    isCorrecting: correction.isSubmitting,
    historyMembershipId,
  };
}
