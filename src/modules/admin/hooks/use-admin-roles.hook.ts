import { useState } from 'react';

import {
  buildMemberRolesQueryOptions,
  buildMembersDirectoryQueryOptions,
  type MemberDirectoryPage,
  type MemberRoles,
} from '@/modules/members';
import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { toRemoteQueryView } from '@/shared/view';

import { ADMIN_ROLES_COPY } from '../constants/admin-labels.constants';
import { ADMIN_LIMITS } from '../constants/admin.constants';
import { buildAdminScreenCopy, resolveAdminScreenStatus } from '../helpers/admin-copy.helper';
import { buildRolesPanel } from '../helpers/roles-panel.helper';
import { useAssignRolesForm } from './use-assign-roles-form.hook';
import { useAdminContext } from './use-admin-context.hook';
import type { AdminRolesView } from '../types/admin-view.types';

/**
 * RBAC assignment. The listed roles are exactly the server's
 * `assignableRoles` — the acting principal's privilege ceiling — so the UI
 * cannot offer an escalation the backend would reject.
 */
export function useAdminRoles(): AdminRolesView {
  const { t } = useAppTranslation();
  const context = useAdminContext();
  const [membershipId, setMembershipId] = useState<string>('');
  const directory = toRemoteQueryView(
    useAppQuery<MemberDirectoryPage>(
      buildMembersDirectoryQueryOptions(context.teamId, { pageSize: ADMIN_LIMITS.members }),
    ),
  );
  const roles = toRemoteQueryView(
    useAppQuery<MemberRoles>(
      buildMemberRolesQueryOptions(context.teamId, membershipId, context.canManageRoles),
    ),
  );
  const memberRoles = roles.data;
  const form = useAssignRolesForm(context.teamId, membershipId, memberRoles?.roles ?? []);
  const members = directory.data?.items ?? [];

  return {
    ...buildAdminScreenCopy(t, {
      keys: ADMIN_ROLES_COPY,
      error: directory.error,
      isOffline: context.isOffline,
      onRetry: directory.refetch,
      emptyTitleKey: I18N_KEYS.adminRoles.emptyTitle,
      emptyMessageKey: I18N_KEYS.adminRoles.emptyMessage,
    }),
    title: t(I18N_KEYS.adminRoles.title),
    subtitle: t(I18N_KEYS.adminRoles.subtitle),
    status: resolveAdminScreenStatus(
      context,
      directory,
      context.canManageRoles,
      members.length > 0,
    ),
    ...buildRolesPanel(t, {
      membershipId,
      hasRoles: memberRoles !== undefined,
      members,
      assignable: memberRoles?.assignableRoles ?? [],
      selected: form.selected,
      reason: form.reason,
      isReasonValid: form.isReasonValid,
      onToggle: form.toggle,
    }),
    isSaving: form.isSaving,
    canSave: form.canSave,
    onMemberChange: setMembershipId,
    onReasonChange: form.setReason,
    onSave: form.save,
  };
}
