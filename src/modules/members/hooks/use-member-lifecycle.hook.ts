import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppMutation, useQueryClient } from '@/packages/query';
import { APP_ERROR_CODE } from '@/shared/errors';
import { toAppError } from '@/shared/errors/app-error.helper';
import { I18N_KEYS } from '@/shared/i18n';
import { useConfirmAlert, useAppToast } from '@/shared/ui';

import {
  LIFECYCLE_ACTION_LABEL_KEYS,
  type LifecycleAction,
  type MembershipStatus,
} from '../constants/members.constants';
import { normalizeOptionalText } from '../helpers/member-form.helper';
import {
  availableLifecycleActions,
  lifecycleActionTone,
} from '../helpers/lifecycle-actions.helper';
import { membersQueryKeys } from '../queries/members.keys';
import { transitionMember } from '../services/transition-member.service';
import type { LifecyclePanelView } from '../types/members-view.types';

/** Lifecycle admin panel: confirm dialog + reason + transition mutation. */
export function useMemberLifecycle(
  teamId: string,
  membershipId: string,
  status: MembershipStatus | undefined,
  canManage: boolean,
): LifecyclePanelView {
  const { t } = useAppTranslation();
  const { confirm } = useConfirmAlert();
  const { showToast } = useAppToast();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const mutation = useAppMutation({
    mutationFn: (action: LifecycleAction) =>
      transitionMember(teamId, membershipId, { action, reason: normalizeOptionalText(reason) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: membersQueryKeys.team(teamId) });
      void showToast({ message: t(I18N_KEYS.members.lifecycleSuccessToast), tone: 'success' });
      setReason('');
    },
    onError: (error) => {
      const isConflict = toAppError(error).code === APP_ERROR_CODE.Conflict;
      if (isConflict) {
        void queryClient.invalidateQueries({ queryKey: membersQueryKeys.team(teamId) });
      }
      void showToast({
        message: t(
          isConflict
            ? I18N_KEYS.members.lifecycleConflictToast
            : I18N_KEYS.members.lifecycleErrorToast,
        ),
        tone: isConflict ? 'warning' : 'danger',
      });
    },
  });
  return {
    heading: t(I18N_KEYS.members.lifecycleHeading),
    canManage,
    noActionsLabel: t(I18N_KEYS.members.lifecycleNoActions),
    actions:
      status === undefined
        ? []
        : availableLifecycleActions(status).map((action) => ({
            action,
            label: t(LIFECYCLE_ACTION_LABEL_KEYS[action]),
            tone: lifecycleActionTone(action),
          })),
    isSubmitting: mutation.isPending,
    reasonLabel: t(I18N_KEYS.members.reasonLabel),
    reasonPlaceholder: t(I18N_KEYS.members.reasonPlaceholder),
    reason,
    onReasonChange: setReason,
    onAction: (action) => {
      void confirm({
        header: t(I18N_KEYS.members.lifecycleConfirmTitle, {
          action: t(LIFECYCLE_ACTION_LABEL_KEYS[action]),
        }),
        message: t(I18N_KEYS.members.lifecycleConfirmMessage),
        confirmLabel: t(I18N_KEYS.members.lifecycleConfirm),
        cancelLabel: t(I18N_KEYS.members.lifecycleCancel),
      }).then((confirmed) => {
        if (confirmed) {
          mutation.mutate(action);
        }
      });
    },
  };
}
