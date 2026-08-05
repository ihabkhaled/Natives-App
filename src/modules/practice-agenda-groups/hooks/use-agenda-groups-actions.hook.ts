import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useConfirmAlert } from '@/shared/ui';

import { isFilledIn } from '../helpers/agenda-groups-form.helper';
import type { AgendaGroupsMutationScope } from '../mutations/practice-agenda-groups-mutations.types';
import type { AgendaGroupsFormsView } from './use-agenda-groups-forms.hook';
import { useAgendaGroupsMutations } from './use-agenda-groups-mutations.hook';

type Translate = (key: string, params?: TranslateParams) => string;

export interface AgendaGroupsActionsView {
  readonly notice: string | null;
  readonly isMutating: boolean;
  readonly onCreateSubmit: () => void;
  readonly onCopySubmit: () => void;
  readonly onAddMember: (groupId: string) => void;
  readonly onRemoveMember: (groupId: string, membershipId: string) => void;
  readonly onRemoveGroup: (groupId: string) => void;
}

const KEYS = I18N_KEYS.practiceAgendaGroups;

/**
 * Every write this screen makes, plus the one notice line they all report
 * through. Removing a group or a member is destructive and irreversible from
 * here, so both go through `useConfirmAlert` first — creating a group and
 * adding a member do not, because either is undone by the removal this same
 * hook already guards. The mutations themselves live in
 * `use-agenda-groups-mutations.hook.ts`; this hook is the callbacks a
 * component actually calls.
 */
export function useAgendaGroupsActions(
  t: Translate,
  scope: AgendaGroupsMutationScope,
  forms: AgendaGroupsFormsView,
): AgendaGroupsActionsView {
  const alert = useConfirmAlert();
  const mutations = useAgendaGroupsMutations(t, scope, forms);

  const confirmThenRun = (titleKey: string, messageKey: string, run: () => void): void => {
    void alert
      .confirm({
        header: t(titleKey),
        message: t(messageKey),
        cancelLabel: t(KEYS.confirmCancel),
        confirmLabel: t(KEYS.confirmProceed),
      })
      .then((confirmed) => {
        if (confirmed) {
          run();
        }
      });
  };

  return {
    notice: mutations.notice,
    isMutating:
      mutations.createGroup.isRunning ||
      mutations.removeGroup.isRunning ||
      mutations.isAssigningMembers ||
      mutations.removeMember.isRunning ||
      mutations.copyAgenda.isRunning,
    onCreateSubmit: () => {
      if (!isFilledIn(forms.createForm.name)) {
        return;
      }
      mutations.createGroup.run({
        name: forms.createForm.name.trim(),
        color: orNull(forms.createForm.color),
        coachMembershipId: orNull(forms.createForm.coachMembershipId),
        notes: orNull(forms.createForm.notes),
      });
    },
    onCopySubmit: () => {
      if (!isFilledIn(forms.copySourceSessionId)) {
        return;
      }
      mutations.copyAgenda.run({ sourceSessionId: forms.copySourceSessionId.trim() });
    },
    onAddMember: (groupId) => {
      const value = forms.addMemberValues[groupId] ?? '';
      if (!isFilledIn(value)) {
        return;
      }
      mutations.runAssignMembers(groupId, [value.trim()]);
    },
    onRemoveMember: (groupId, membershipId) => {
      confirmThenRun(KEYS.removeMemberConfirmTitle, KEYS.removeMemberConfirmMessage, () => {
        mutations.removeMember.run({ groupId, membershipId });
      });
    },
    onRemoveGroup: (groupId) => {
      confirmThenRun(KEYS.removeGroupConfirmTitle, KEYS.removeGroupConfirmMessage, () => {
        mutations.removeGroup.run({ groupId });
      });
    },
  };
}

/** `null` fields are left out of the request; the gateway is what tells the two apart. */
function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}
