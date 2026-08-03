import { useState } from 'react';

import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  clampWithdrawalReason,
  isWithdrawalReasonValid,
  resolveWithdrawalReasonMessage,
} from '../helpers/withdrawal-reason.helper';
import { useWithdrawCandidateMutation } from '../mutations/use-withdraw-candidate-mutation.hook';
import type { TryoutCandidate } from '../types/tryout-candidates.types';
import type { CandidateWithdrawalView } from '../types/tryout-candidates-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

export interface CandidateWithdrawalApi {
  readonly view: CandidateWithdrawalView | null;
  readonly notice: string | null;
  readonly open: () => void;
}

/**
 * The withdrawal step, deliberately a separate panel rather than a button on
 * the row.
 *
 * Withdrawing is destructive from the candidate's side: someone who applied to
 * play is taken out of the process. So the sequence is open the person's
 * record, read what withdrawal does, write down why, and only then send it.
 * Nothing here is a one-click action, and there is no optimistic update — the
 * status a reviewer sees afterwards is the server's answer.
 *
 * The panel is keyed to the candidate it was opened for, so selecting somebody
 * else closes it instead of quietly re-aiming a half-typed reason at a
 * different person.
 */
export function useCandidateWithdrawal(
  t: Translate,
  teamId: string,
  candidate: TryoutCandidate | null,
): CandidateWithdrawalApi {
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const mutation = useWithdrawCandidateMutation(teamId, {
    onSuccess: (): void => {
      setNotice(null);
      setTargetId('');
      setReason('');
    },
    onError: (): void => {
      setNotice(t(I18N_KEYS.tryoutCandidates.actionFailed));
    },
  });

  const isOpen = candidate !== null && candidate.candidateId === targetId;
  const canSubmit = isWithdrawalReasonValid(reason) && !mutation.isRunning;

  return {
    notice,
    open: (): void => {
      if (candidate !== null) {
        setNotice(null);
        setReason('');
        setTargetId(candidate.candidateId);
      }
    },
    view:
      candidate === null || !isOpen
        ? null
        : {
            heading: t(I18N_KEYS.training.actionWithdraw),
            subjectName: candidate.displayName,
            consequence: t(I18N_KEYS.dataQuality.previewIrreversible),
            notice: t(I18N_KEYS.tryouts.decisionIntro),
            reasonLabel: t(I18N_KEYS.tryouts.decisionReasonLabel),
            reasonPlaceholder: t(I18N_KEYS.tryouts.decisionReasonPlaceholder),
            reason,
            validationMessage: resolveWithdrawalReasonMessage(t, reason),
            submitLabel: t(I18N_KEYS.training.actionWithdraw),
            cancelLabel: t(I18N_KEYS.dataQuality.cancelLabel),
            canSubmit,
            isSubmitting: mutation.isRunning,
            onReasonChange: (value: string): void => {
              setReason(clampWithdrawalReason(value));
            },
            onSubmit: (): void => {
              mutation.run({
                candidateId: candidate.candidateId,
                reason: reason.trim(),
                expectedRecordVersion: candidate.recordVersion,
              });
            },
            onCancel: (): void => {
              setTargetId('');
              setReason('');
            },
          },
  };
}
