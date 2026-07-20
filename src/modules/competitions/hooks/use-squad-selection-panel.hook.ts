import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { EMPTY_GENDER_RATIO } from '../constants/competitions.constants';
import {
  buildCandidateRow,
  buildRatioFacts,
  needsOverride,
} from '../helpers/eligibility-view.helper';
import { buildOverrideDialog } from '../helpers/override-dialog.helper';
import { useSelectPlayerMutation } from '../mutations/use-select-player-mutation.hook';
import type { EligibilityCandidate } from '../types/competitions.types';
import type { EligibilityPanelView } from '../types/competitions-view.types';
import type { SquadPanelInput } from '../types/selection.types';
import { useSquadEligibilityQuery } from './use-squad-eligibility-query.hook';

/**
 * The advisory eligibility table and its selection actions. Signals never
 * exclude anyone: a candidate the policy failed can still be selected, and
 * doing so opens the override dialog that demands a written reason.
 */
export function useSquadSelectionPanel(input: SquadPanelInput): EligibilityPanelView {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const [pending, setPending] = useState<EligibilityCandidate | null>(null);
  const [reason, setReason] = useState('');

  const report = useSquadEligibilityQuery(input.teamId, input.squadId);
  const candidates = report.data?.candidates ?? [];
  const ratio = report.data?.selectedGenderRatio ?? EMPTY_GENDER_RATIO;

  const closeDialog = (): void => {
    setPending(null);
    setReason('');
  };

  const selection = useSelectPlayerMutation(input.teamId, input.squadId, {
    onSuccess: () => {
      closeDialog();
      void toast.showToast({ message: t(I18N_KEYS.squads.transitionDone), tone: 'success' });
    },
    onError: () => {
      void toast.showToast({ message: t(I18N_KEYS.squads.actionFailed), tone: 'danger' });
    },
  });

  const toggle = (membershipId: string): void => {
    const candidate = candidates.find((item) => item.membershipId === membershipId);
    if (candidate === undefined) {
      return;
    }
    if (candidate.selected) {
      selection.run({ intent: 'remove', membershipId });
      return;
    }
    if (needsOverride(candidate)) {
      setPending(candidate);
      setReason('');
      return;
    }
    selection.run({ intent: 'select', membershipId });
  };

  return {
    heading: t(I18N_KEYS.squads.eligibilityHeading),
    intro: t(I18N_KEYS.squads.eligibilityIntro),
    advisoryNotice: t(I18N_KEYS.squads.eligibilityAdvisory),
    emptyLabel: t(I18N_KEYS.squads.eligibilityEmpty),
    lockedNotice: input.isLocked ? t(I18N_KEYS.squads.lockedNotice) : null,
    rows: candidates.map((candidate) =>
      buildCandidateRow(t, candidate, {
        canSelect: input.canSelect,
        canOverride: input.canOverride,
        isLocked: input.isLocked,
      }),
    ),
    ratioHeading: t(I18N_KEYS.squads.ratioHeading),
    ratioFacts: buildRatioFacts(t, ratio),
    ratioVerdict: ratio.balanced
      ? t(I18N_KEYS.squads.ratioBalanced)
      : t(I18N_KEYS.squads.ratioUnbalanced),
    override:
      pending === null
        ? null
        : buildOverrideDialog(t, {
            candidate: pending,
            reason,
            isSaving: selection.isRunning,
            onReasonChange: setReason,
            onConfirm: () => {
              selection.run({
                intent: 'override',
                membershipId: pending.membershipId,
                overrideReason: reason.trim(),
              });
            },
            onCancel: closeDialog,
          }),
    onToggle: toggle,
  };
}
