import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppMutation, useAppQuery, useQueryClient } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import type { MemberRole } from '../constants/members.constants';
import { buildRoleToggles, rolesDiffer, toggleRole } from '../helpers/role-toggle.helper';
import { membersQueryKeys } from '../queries/members.keys';
import { buildMemberRolesQueryOptions } from '../queries/member-roles.query';
import { assignMemberRoles } from '../services/assign-member-roles.service';
import type { RolesPanelView } from '../types/members-view.types';

/** Role-assignment panel: ceiling-aware toggles + replace mutation. */
export function useMemberRoles(
  teamId: string,
  membershipId: string,
  canManage: boolean,
): RolesPanelView {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const { showToast } = useAppToast();
  const [draft, setDraft] = useState<readonly MemberRole[] | null>(null);
  const query = useAppQuery(buildMemberRolesQueryOptions(teamId, membershipId, canManage));
  const roles = query.data?.roles ?? [];
  const assignable = query.data?.assignableRoles ?? [];
  const selected = draft ?? roles;
  const mutation = useAppMutation({
    mutationFn: () => assignMemberRoles(teamId, membershipId, selected),
    onSuccess: (result) => {
      queryClient.setQueryData(membersQueryKeys.roles(teamId, membershipId), result);
      setDraft(null);
      void showToast({ message: t(I18N_KEYS.members.roleAssignedToast), tone: 'success' });
    },
    onError: () => {
      void showToast({ message: t(I18N_KEYS.members.roleErrorToast), tone: 'danger' });
    },
  });
  return {
    heading: t(I18N_KEYS.members.rolesHeading),
    description: t(I18N_KEYS.members.rolesDescription),
    ceilingNotice: canManage ? t(I18N_KEYS.members.rolesCeilingNotice) : null,
    emptyLabel: t(I18N_KEYS.members.rolesEmpty),
    canManage,
    roles: buildRoleToggles(t, selected, assignable),
    onToggle: (role) => {
      setDraft(toggleRole(selected, role, assignable));
    },
    saveLabel: t(I18N_KEYS.members.rolesSave),
    savingLabel: t(I18N_KEYS.members.rolesSaving),
    isSaving: mutation.isPending,
    isDirty: draft !== null && rolesDiffer(draft, roles),
    onSave: () => {
      mutation.mutate(undefined);
    },
  };
}
