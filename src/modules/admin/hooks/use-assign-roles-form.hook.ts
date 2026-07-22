import { useState } from 'react';

import {
  assignMemberRoles,
  membersQueryKeys,
  resolveRoleErrorKey,
  type MemberRole,
  type MemberRoles,
} from '@/modules/members';
import { useAppTranslation } from '@/packages/i18n';
import { useInvalidatingMutation } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { ADMIN_LIMITS } from '../constants/admin.constants';

export interface AssignRolesFormView {
  readonly selected: readonly MemberRole[];
  readonly reason: string;
  readonly isReasonValid: boolean;
  readonly isSaving: boolean;
  readonly canSave: boolean;
  readonly setReason: (value: string) => void;
  readonly toggle: (role: MemberRole) => void;
  readonly save: () => void;
}

/**
 * The role-assignment draft. A reason is mandatory because the change is
 * audited; the save is blocked locally rather than sent and rejected.
 */
export function useAssignRolesForm(
  teamId: string,
  membershipId: string,
  serverRoles: readonly MemberRole[],
): AssignRolesFormView {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const [draft, setDraft] = useState<readonly MemberRole[] | null>(null);
  const [reason, setReason] = useState<string>('');
  const selected = draft ?? serverRoles;
  const mutation = useInvalidatingMutation<MemberRoles, readonly MemberRole[]>({
    mutationFn: (roles) => assignMemberRoles(teamId, membershipId, roles),
    invalidateKey: membersQueryKeys.roles(teamId, membershipId),
    onSuccess: () => {
      setDraft(null);
      setReason('');
      void toast.showToast({ message: t(I18N_KEYS.adminRoles.savedToast), tone: 'success' });
    },
    onError: (error) => {
      // A refused change must not read as a success: drop the optimistic
      // draft so the panel shows the roles the server actually holds, and
      // state the SPECIFIC refusal (409 accountRequired, escalation denied,
      // role not found) instead of a generic "could not update" message.
      setDraft(null);
      void toast.showToast({ message: t(resolveRoleErrorKey(error)), tone: 'danger' });
    },
  });

  const isReasonValid = reason.trim().length >= ADMIN_LIMITS.minimumReasonLength;
  return {
    selected,
    reason,
    isReasonValid,
    isSaving: mutation.isRunning,
    canSave: isReasonValid && membershipId !== '' && !mutation.isRunning,
    setReason,
    toggle: (role: MemberRole) => {
      setDraft((current) => {
        const base = current ?? serverRoles;
        return base.includes(role) ? base.filter((entry) => entry !== role) : [...base, role];
      });
    },
    save: () => {
      if (isReasonValid && membershipId !== '') {
        mutation.run(selected);
      }
    },
  };
}
