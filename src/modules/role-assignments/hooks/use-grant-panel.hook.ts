import { useState } from 'react';

import type { TranslateParams } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { toRemoteQueryView } from '@/shared/view';

import { buildRoleOptions, resolveGrantIntent } from '../helpers/grant-draft.helper';
import type { GrantInput } from '../mutations/use-assign-role-mutation.hook';
import { buildAssignableRolesQueryOptions } from '../queries/assignable-roles.query';
import type { AssignableRole } from '../types/role-assignments.types';
import type { GrantPanelView } from '../types/role-assignments-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** What the screen lends the panel: who it grants to, and how to send it. */
export interface GrantPanelActions {
  readonly targetUserId: string;
  readonly isGranting: boolean;
  readonly onGrant: (input: GrantInput) => void;
}

/**
 * The grant form's view model.
 *
 * The role options come from the server's assignable-roles catalog and from
 * nowhere else — no hard-coded list, no filtered copy of one. That is the
 * whole mechanism behind "never offer a role the server will refuse": the
 * actor's privilege ceiling is computed where it is enforced, and the form
 * simply renders the answer.
 *
 * The panel is absent, rather than disabled, until a target user is named and
 * the principal actually holds the grant. A greyed-out escalation control
 * invites someone to go looking for the way to enable it.
 */
export function useGrantPanel(
  t: Translate,
  teamId: string,
  canManage: boolean,
  actions: GrantPanelActions,
): GrantPanelView | null {
  const [roleSlug, setRoleSlug] = useState('');

  const query = toRemoteQueryView<readonly AssignableRole[]>(
    useAppQuery(buildAssignableRolesQueryOptions(teamId, canManage)),
  );
  const roles = query.data ?? [];
  const options = buildRoleOptions(t, roles);
  const intent = resolveGrantIntent({ userId: actions.targetUserId, roleSlug }, roles);

  if (!canManage || actions.targetUserId === '') {
    return null;
  }
  return {
    heading: t(I18N_KEYS.adminRoles.assignableHeading),
    ceilingNotice: t(I18N_KEYS.adminRoles.ceilingNotice),
    roleLabel: t(I18N_KEYS.members.inviteRoleLabel),
    roleValue: roleSlug,
    options,
    onRoleChange: setRoleSlug,
    emptyCatalogMessage: options.length === 0 ? t(I18N_KEYS.adminRoles.noAssignable) : null,
    submitLabel: t(I18N_KEYS.adminRoles.saveRoles),
    canSubmit: intent !== null && !actions.isGranting,
    isGranting: actions.isGranting,
    onSubmit: (): void => {
      // Re-checked, not merely re-read: the catalog can shrink while the form
      // is open, and the last word on what may be sent is the current one.
      if (intent !== null) {
        actions.onGrant(intent);
      }
    },
  };
}
