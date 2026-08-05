import { useRef, useState } from 'react';

import type { InvalidatingMutationView } from '@/packages/query';
import type { TranslateParams } from '@/packages/i18n';

import { AGENDA_GROUP_OUTCOME_COPY_KEYS } from '../constants/practice-agenda-groups-copy.constants';
import { AGENDA_GROUP_OUTCOME } from '../constants/practice-agenda-groups.constants';
import { useAssignGroupMembersMutation } from '../mutations/use-assign-group-members-mutation.hook';
import { useCopyAgendaMutation } from '../mutations/use-copy-agenda-mutation.hook';
import { useCreateGroupMutation } from '../mutations/use-create-group-mutation.hook';
import { useRemoveGroupMutation } from '../mutations/use-remove-group-mutation.hook';
import { useRemoveGroupMemberMutation } from '../mutations/use-remove-group-member-mutation.hook';
import type {
  AgendaGroupsMutationScope,
  CopyAgendaInput,
  CreateGroupInput,
  RemoveGroupInput,
  RemoveGroupMemberInput,
} from '../mutations/practice-agenda-groups-mutations.types';
import type { AgendaGroupsFormsView } from './use-agenda-groups-forms.hook';

type Translate = (key: string, params?: TranslateParams) => string;

export interface AgendaGroupsMutationsView {
  readonly notice: string | null;
  readonly createGroup: InvalidatingMutationView<CreateGroupInput>;
  readonly removeGroup: InvalidatingMutationView<RemoveGroupInput>;
  readonly isAssigningMembers: boolean;
  /**
   * Wraps `assignMembers.run`: recording which group the call is for lives
   * here, next to the ref it is written to, rather than in a caller that
   * would otherwise reach into this hook's own state.
   */
  readonly runAssignMembers: (groupId: string, membershipIds: readonly string[]) => void;
  readonly removeMember: InvalidatingMutationView<RemoveGroupMemberInput>;
  readonly copyAgenda: InvalidatingMutationView<CopyAgendaInput>;
}

/**
 * The five writes this screen makes, wired to the one notice line they all
 * report through. Split out of `use-agenda-groups-actions.hook.ts` so that
 * hook stays under the file's line budget and reads as "what a button does"
 * rather than "how five mutations are constructed".
 */
export function useAgendaGroupsMutations(
  t: Translate,
  scope: AgendaGroupsMutationScope,
  forms: AgendaGroupsFormsView,
): AgendaGroupsMutationsView {
  const [notice, setNotice] = useState<string | null>(null);
  const pendingAddMemberGroupId = useRef<string | null>(null);

  const reportOutcome = (outcome: keyof typeof AGENDA_GROUP_OUTCOME_COPY_KEYS): void => {
    setNotice(t(AGENDA_GROUP_OUTCOME_COPY_KEYS[outcome]));
  };
  const reportFailure = (): void => {
    reportOutcome(AGENDA_GROUP_OUTCOME.ActionFailed);
  };

  const createGroup = useCreateGroupMutation(scope, {
    onSuccess: () => {
      forms.resetCreateForm();
      reportOutcome(AGENDA_GROUP_OUTCOME.GroupCreated);
    },
    onError: reportFailure,
  });
  const removeGroup = useRemoveGroupMutation(scope, {
    onSuccess: () => {
      reportOutcome(AGENDA_GROUP_OUTCOME.GroupRemoved);
    },
    onError: reportFailure,
  });
  const assignMembers = useAssignGroupMembersMutation(scope, {
    onSuccess: () => {
      const groupId = pendingAddMemberGroupId.current;
      if (groupId !== null) {
        forms.resetAddMemberValue(groupId);
      }
      reportOutcome(AGENDA_GROUP_OUTCOME.MemberAdded);
    },
    onError: reportFailure,
  });
  const removeMember = useRemoveGroupMemberMutation(scope, {
    onSuccess: () => {
      reportOutcome(AGENDA_GROUP_OUTCOME.MemberRemoved);
    },
    onError: reportFailure,
  });
  const copyAgenda = useCopyAgendaMutation(scope, {
    onSuccess: () => {
      forms.resetCopyForm();
      reportOutcome(AGENDA_GROUP_OUTCOME.AgendaCopied);
    },
    onError: reportFailure,
  });

  return {
    notice,
    createGroup,
    removeGroup,
    isAssigningMembers: assignMembers.isRunning,
    runAssignMembers: (groupId, membershipIds) => {
      pendingAddMemberGroupId.current = groupId;
      assignMembers.run({ groupId, membershipIds });
    },
    removeMember,
    copyAgenda,
  };
}
