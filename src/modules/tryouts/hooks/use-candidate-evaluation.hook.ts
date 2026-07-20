import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import type { EvaluationCriterion } from '../constants/tryouts.constants';
import {
  buildEvaluationRows,
  buildScoreDraft,
  buildScoreOptions,
  draftToScores,
} from '../helpers/decision-view.helper';
import { useSaveEvaluationMutation } from '../mutations/use-save-evaluation-mutation.hook';
import type { CandidatePanelInput } from '../types/mutation.types';
import type { EvaluationPanelView } from '../types/tryouts-view.types';

/**
 * Evaluator scoring. A criterion the evaluator did not observe stays "not
 * scored" and is sent as null; it is never rounded down to a zero.
 */
export function useCandidateEvaluation(input: CandidatePanelInput): EvaluationPanelView {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const [draft, setDraft] = useState<Record<EvaluationCriterion, string> | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const save = useSaveEvaluationMutation(input.teamId, input.tryoutId, {
    onSuccess: () => {
      setDraft(null);
      setNote(null);
      void toast.showToast({ message: t(I18N_KEYS.tryouts.evaluationSaved), tone: 'success' });
    },
    onError: () => {
      void toast.showToast({ message: t(I18N_KEYS.tryouts.actionFailed), tone: 'danger' });
    },
  });

  const scores = draft ?? buildScoreDraft(input.detail?.scores ?? []);
  const noteValue = note ?? input.detail?.evaluationNote ?? '';

  return {
    heading: t(I18N_KEYS.tryouts.evaluationHeading),
    intro: t(I18N_KEYS.tryouts.evaluationIntro),
    rows: buildEvaluationRows(t, scores, buildScoreOptions(t), (criterion, value) => {
      setDraft({ ...scores, [criterion]: value });
    }),
    noteLabel: t(I18N_KEYS.tryouts.evaluationNoteLabel),
    notePlaceholder: t(I18N_KEYS.tryouts.evaluationNotePlaceholder),
    noteValue,
    submitLabel: t(I18N_KEYS.tryouts.evaluationSubmit),
    isSaving: save.isRunning,
    forbiddenNotice: input.isPermitted ? null : t(I18N_KEYS.tryouts.evaluationForbidden),
    onNoteChange: setNote,
    onSubmit: () => {
      const candidateId = input.detail?.summary.candidateId ?? null;
      if (candidateId !== null) {
        save.run({
          candidateId,
          scores: draftToScores(scores),
          note: noteValue.trim() === '' ? null : noteValue.trim(),
        });
      }
    },
  };
}
