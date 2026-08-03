import { useState } from 'react';

import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useConfirmAlert } from '@/shared/ui';

import {
  useAssignRoleMutation,
  type GrantInput,
  type GrantScope,
} from '../mutations/use-assign-role-mutation.hook';
import { useRevokeAssignmentMutation } from '../mutations/use-revoke-assignment-mutation.hook';

type Translate = (key: string, params?: TranslateParams) => string;

export interface RoleAssignmentsActionsView {
  readonly notice: string | null;
  readonly isGranting: boolean;
  readonly isRevoking: boolean;
  readonly onGrant: (input: GrantInput) => void;
  readonly confirmRevoke: (assignmentId: string, confirmMessage: string) => void;
}

/**
 * The two commands this screen issues, and the single notice line they share.
 *
 * Revocation is confirm-gated and the confirmation NAMES ITS TARGET: the
 * message is the row's own summary — user, role, scope — so an administrator
 * cannot dismiss a dialog without having read whose access is ending. Granting
 * is not gated the same way, because a grant is visible in the list
 * immediately afterwards and can be taken back; a revocation cannot be
 * un-clicked.
 *
 * Every failure resolves to one sentence. A raw refusal from the RBAC layer
 * ("privilege ceiling exceeded") reads like an accusation and leaks the shape
 * of the server's policy; what the operator needs to know is that it did not
 * happen.
 */
export function useRoleAssignmentsActions(
  t: Translate,
  scope: GrantScope,
): RoleAssignmentsActionsView {
  const { confirm } = useConfirmAlert();
  const [notice, setNotice] = useState<string | null>(null);

  const clearNotice = (): void => {
    setNotice(null);
  };
  const reportFailure = (): void => {
    setNotice(t(I18N_KEYS.roleAssignments.actionFailed));
  };

  const grant = useAssignRoleMutation(scope, { onSuccess: clearNotice, onError: reportFailure });
  const revoke = useRevokeAssignmentMutation({
    onSuccess: clearNotice,
    onError: reportFailure,
  });

  return {
    notice,
    isGranting: grant.isRunning,
    isRevoking: revoke.isRunning,
    onGrant: grant.run,
    confirmRevoke: (assignmentId: string, confirmMessage: string): void => {
      void confirm({
        header: t(I18N_KEYS.adminPlatform.revokeAction),
        message: confirmMessage,
        confirmLabel: t(I18N_KEYS.adminPlatform.revokeConfirmAction),
        cancelLabel: t(I18N_KEYS.adminPlatform.confirmCancel),
      }).then((confirmed) => {
        if (confirmed) {
          revoke.run(assignmentId);
        }
      });
    },
  };
}
