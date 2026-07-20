import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast, useConfirmAlert } from '@/shared/ui';

import {
  ROSTER_ACTION_LABEL_KEYS,
  ROSTER_ACTION_TONES,
} from '../constants/rosters-labels.constants';
import { availableRosterActions } from '../helpers/roster-detail.helper';
import { useRosterLifecycleMutation } from '../mutations/use-roster-lifecycle-mutation.hook';
import type { RosterLifecycleActionView } from '../types/rosters-view.types';
import type { Roster } from '../types/rosters.types';

/** The scope, record, and grants a roster lifecycle action needs. */
export interface RosterLifecycleInput {
  readonly teamId: string;
  readonly rosterId: string;
  readonly roster: Roster | null;
  readonly publishable: boolean;
  readonly canManage: boolean;
  readonly canLock: boolean;
}

/**
 * Publish, lock, or archive a roster. Publishing is offered only when the
 * server-side validation says the roster is publishable, and every action
 * confirms first and carries the record version.
 */
export function useRosterLifecycle(
  input: RosterLifecycleInput,
): readonly RosterLifecycleActionView[] {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const alert = useConfirmAlert();
  const mutation = useRosterLifecycleMutation(input.teamId, input.rosterId, {
    onSuccess: () => {
      void toast.showToast({ message: t(I18N_KEYS.rosters.actionDone), tone: 'success' });
    },
    onError: () => {
      void toast.showToast({ message: t(I18N_KEYS.rosters.actionFailed), tone: 'danger' });
    },
  });

  const run = (intent: 'publish' | 'lock' | 'archive', expectedRecordVersion: number): void => {
    void alert
      .confirm({
        header: t(I18N_KEYS.rosters.confirmTitle),
        message: t(I18N_KEYS.rosters.confirmMessage),
        cancelLabel: t(I18N_KEYS.rosters.confirmCancel),
        confirmLabel: t(I18N_KEYS.rosters.confirmCta),
      })
      .then((confirmed) => {
        if (confirmed) {
          mutation.run({ intent, expectedRecordVersion });
        }
      });
  };

  const roster = input.roster;
  if (roster === null) {
    return [];
  }
  return availableRosterActions(
    roster.status,
    { canManage: input.canManage, canLock: input.canLock },
    input.publishable,
  ).map((action) => ({
    key: action,
    label: t(ROSTER_ACTION_LABEL_KEYS[action]),
    tone: ROSTER_ACTION_TONES[action],
    isBusy: mutation.isRunning,
    onSelect: () => {
      run(action, roster.recordVersion);
    },
  }));
}
