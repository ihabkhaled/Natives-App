import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast, useConfirmAlert } from '@/shared/ui';

import { SQUAD_TRANSITION_TONES } from '../constants/competitions-labels.constants';
import type { SquadTransition } from '../constants/competitions.constants';
import { availableTransitions, transitionLabel } from '../helpers/squad-view.helper';
import { useTransitionSquadMutation } from '../mutations/use-transition-squad-mutation.hook';
import type { Squad } from '../types/competitions.types';
import type { SquadTransitionActionView } from '../types/competitions-view.types';

/** The scope and record a lifecycle action needs to be safe. */
export interface SquadTransitionsInput {
  readonly teamId: string;
  readonly squadId: string;
  readonly squad: Squad | null;
  readonly canManage: boolean;
}

/**
 * The publish / lock / revise / archive actions the current status allows.
 * Each one confirms first and carries the record version, so a stale client
 * gets a 409 instead of silently overwriting another coach's revision.
 */
export function useSquadTransitions(
  input: SquadTransitionsInput,
): readonly SquadTransitionActionView[] {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const alert = useConfirmAlert();
  const mutation = useTransitionSquadMutation(input.teamId, input.squadId, {
    onSuccess: () => {
      void toast.showToast({ message: t(I18N_KEYS.squads.transitionDone), tone: 'success' });
    },
    onError: () => {
      void toast.showToast({ message: t(I18N_KEYS.squads.actionFailed), tone: 'danger' });
    },
  });

  const run = (next: SquadTransition, expectedRecordVersion: number): void => {
    void alert
      .confirm({
        header: t(I18N_KEYS.squads.transitionConfirmTitle),
        message: t(I18N_KEYS.squads.transitionConfirmMessage),
        cancelLabel: t(I18N_KEYS.squads.transitionCancel),
        confirmLabel: t(I18N_KEYS.squads.transitionConfirmCta),
      })
      .then((confirmed) => {
        if (confirmed) {
          mutation.run({ transition: next, expectedRecordVersion });
        }
      });
  };

  const squad = input.squad;
  if (squad === null) {
    return [];
  }
  return availableTransitions(squad.status, input.canManage).map((next) => ({
    transition: next,
    label: transitionLabel(t, next),
    tone: SQUAD_TRANSITION_TONES[next],
    isBusy: mutation.isRunning,
    onSelect: () => {
      run(next, squad.recordVersion);
    },
  }));
}
