import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  CANDIDATE_STATUS_LABEL_KEYS,
  CANDIDATE_STATUS_TONES,
} from '../constants/tryouts-labels.constants';
import { buildContactsBlock, buildReadinessBlock } from '../helpers/candidate-view.helper';
import type { CandidateDetail } from '../types/tryouts.types';
import type { CandidatePanelView, TryoutsContextView } from '../types/tryouts-view.types';
import { useCandidateConversion } from './use-candidate-conversion.hook';
import { useCandidateDecision } from './use-candidate-decision.hook';
import { useCandidateEvaluation } from './use-candidate-evaluation.hook';

/** Scope, record, and grants the candidate workspace panel composes from. */
export interface CandidateWorkspaceInput {
  readonly tryoutId: string;
  readonly detail: CandidateDetail | null;
  readonly context: TryoutsContextView;
}

/**
 * One candidate workspace: restricted contact and readiness blocks, the
 * evaluation form, the decision panel, and the conversion preview. Each block
 * carries its own grant so a partially-privileged staff member sees exactly
 * what policy allows and an explicit restricted state for the rest.
 *
 * Returns null until a candidate is selected; the sub-hooks still run so the
 * hook order never changes between renders.
 */
export function useCandidatePanel(input: CandidateWorkspaceInput): CandidatePanelView | null {
  const { t } = useAppTranslation();
  const { context, detail } = input;
  const base = { teamId: context.teamId, tryoutId: input.tryoutId, detail };

  const evaluation = useCandidateEvaluation({ ...base, isPermitted: context.canEvaluate });
  const decision = useCandidateDecision({ ...base, isPermitted: context.canDecide });
  const conversion = useCandidateConversion({ ...base, isPermitted: context.canConvert });

  if (detail === null) {
    return null;
  }
  return {
    heading: detail.summary.displayName,
    referenceLabel: `${t(I18N_KEYS.tryouts.referenceLabel)}: ${detail.summary.reference}`,
    statusLabel: t(CANDIDATE_STATUS_LABEL_KEYS[detail.summary.status]),
    statusTone: CANDIDATE_STATUS_TONES[detail.summary.status],
    consentLabel: t(I18N_KEYS.tryouts.consentVersionLabel, { version: detail.consentVersion }),
    contacts: buildContactsBlock(t, detail, context.canReadContacts),
    readiness: buildReadinessBlock(t, detail, context.canReadReadiness),
    evaluation,
    decision,
    conversion,
  };
}
