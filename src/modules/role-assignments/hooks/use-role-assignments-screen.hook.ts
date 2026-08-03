import { useState } from 'react';

import { formatCairoDateTime } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, resolveAsyncViewStatus, toRemoteQueryView } from '@/shared/view';

import { ROLE_ASSIGNMENTS_SCREEN_COPY_KEYS } from '../constants/role-assignments-copy.constants';
import { buildAssignmentRowViews } from '../helpers/assignment-row.helper';
import { buildUserAssignmentsQueryOptions } from '../queries/role-assignments.query';
import { roleAssignmentsPagePath } from '../routes/role-assignments.paths';
import type { UserAssignments } from '../types/role-assignments.types';
import type { RoleAssignmentsScreenView } from '../types/role-assignments-view.types';
import { useGrantPanel } from './use-grant-panel.hook';
import { useRoleAssignmentsActions } from './use-role-assignments-actions.hook';
import { useRoleAssignmentsContext } from './use-role-assignments-context.hook';

const KEYS = I18N_KEYS.roleAssignments;

/**
 * View model for the RBAC admin screen: one user's assignments, what may be
 * taken away, and what may be granted.
 *
 * The screen is addressed by user id rather than by browsing every assignment,
 * because that is the shape the contract offers — `GET /rbac/users/{id}
 * /assignments` — and because "show me everyone's access" is a report, not an
 * admin action. Until a target is named there is nothing to read, so the
 * screen rests in its empty state rather than spinning on a request nobody
 * made.
 */
export function useRoleAssignmentsScreen(): RoleAssignmentsScreenView {
  const { t, locale } = useAppTranslation();
  const context = useRoleAssignmentsContext();
  const [targetDraft, setTargetDraft] = useState('');
  const target = targetDraft.trim();

  const actions = useRoleAssignmentsActions(t, {
    teamId: context.teamId,
    seasonId: context.seasonId,
  });
  const query = toRemoteQueryView<UserAssignments>(
    useAppQuery(buildUserAssignmentsQueryOptions(target)),
  );
  const rows = buildAssignmentRowViews(
    t,
    (iso) => formatCairoDateTime(iso, locale),
    query.data?.assignments ?? [],
    {
      // One command at a time: a second revoke fired while the first is in
      // flight would act on a list the server has already changed.
      canRevoke: context.canManage && !actions.isRevoking,
      onRevoke: actions.confirmRevoke,
    },
  );
  const grant = useGrantPanel(t, context.teamId, context.canManage, {
    targetUserId: target,
    isGranting: actions.isGranting,
    onGrant: actions.onGrant,
  });

  return {
    ...buildScreenCopy(t, {
      keys: ROLE_ASSIGNMENTS_SCREEN_COPY_KEYS,
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      emptyTitleKey: KEYS.emptyTitle,
      emptyMessageKey: KEYS.emptyMessage,
    }),
    path: roleAssignmentsPagePath(),
    pageTitle: t(KEYS.title),
    subtitle: t(KEYS.subtitle),
    status: resolveAsyncViewStatus({
      // Forbidden is a verdict, not a default: it waits for the grants.
      isForbidden: !context.isLoading && !context.canManage,
      isLoading: context.isLoading || (target !== '' && query.isLoading),
      hasError: query.error !== null,
      isOffline: context.isOffline,
      hasData: target === '' || query.data !== undefined,
      hasItems: rows.length > 0,
    }),
    targetLabel: t(I18N_KEYS.adminPlatform.userIdLabel),
    targetPlaceholder: t(I18N_KEYS.adminPlatform.userIdPlaceholder),
    targetValue: targetDraft,
    onTargetChange: setTargetDraft,
    listHeading: t(KEYS.listHeading),
    listIntro: t(KEYS.listIntro),
    countLabel: t(KEYS.countLabel, { total: rows.length }),
    notice: actions.notice,
    rows,
    grant,
  };
}
