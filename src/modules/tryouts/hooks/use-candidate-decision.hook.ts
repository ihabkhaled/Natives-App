import { useState } from 'react';

import { formatCairoDateTime } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { DECISION_LABEL_KEYS, DECISION_TEST_IDS } from '../constants/tryouts-labels.constants';
import { DECISION_OUTCOMES } from '../constants/tryouts.constants';
import {
  decisionLabel,
  decisionTone,
  isDecisionReasonValid,
} from '../helpers/decision-view.helper';
import { useDecideCandidateMutation } from '../mutations/use-decide-candidate-mutation.hook';
import type { CandidatePanelInput } from '../types/mutation.types';
import type { DecisionPanelView } from '../types/tryouts-view.types';

/**
 * The decision and offer panel. Every outcome demands a reason; the candidate
 * sees the decision, never the evaluator notes behind it.
 */
export function useCandidateDecision(input: CandidatePanelInput): DecisionPanelView {
  const { t, locale } = useAppTranslation();
  const toast = useAppToast();
  const [reason, setReason] = useState('');

  const decide = useDecideCandidateMutation(input.teamId, input.tryoutId, {
    onSuccess: () => {
      setReason('');
      void toast.showToast({ message: t(I18N_KEYS.tryouts.decisionRecorded), tone: 'success' });
    },
    onError: () => {
      void toast.showToast({ message: t(I18N_KEYS.tryouts.actionFailed), tone: 'danger' });
    },
  });

  const isValid = isDecisionReasonValid(reason);
  const expiry = input.detail?.decision?.offerExpiresAt ?? null;

  return {
    heading: t(I18N_KEYS.tryouts.decisionHeading),
    intro: t(I18N_KEYS.tryouts.decisionIntro),
    currentLabel: decisionLabel(t, input.detail),
    offerExpiryLabel:
      expiry === null
        ? null
        : `${t(I18N_KEYS.tryouts.offerExpiryLabel)}: ${formatCairoDateTime(expiry, locale)}`,
    reasonLabel: t(I18N_KEYS.tryouts.decisionReasonLabel),
    reasonPlaceholder: t(I18N_KEYS.tryouts.decisionReasonPlaceholder),
    reasonValue: reason,
    validationMessage: isValid ? null : t(I18N_KEYS.tryouts.decisionReasonRequired),
    actions: input.isPermitted
      ? DECISION_OUTCOMES.map((outcome) => ({
          outcome,
          label: t(DECISION_LABEL_KEYS[outcome]),
          tone: decisionTone(outcome),
          testId: DECISION_TEST_IDS[outcome],
          onSelect: () => {
            const candidateId = input.detail?.summary.candidateId ?? null;
            if (isValid && candidateId !== null) {
              decide.run({ candidateId, outcome, reason: reason.trim() });
            }
          },
        }))
      : [],
    isSaving: decide.isRunning,
    forbiddenNotice: input.isPermitted ? null : t(I18N_KEYS.tryouts.decisionForbidden),
    onReasonChange: setReason,
  };
}
