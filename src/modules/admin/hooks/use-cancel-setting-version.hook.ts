import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useInvalidatingMutation } from '@/packages/query';
import { isAppError } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast, useConfirmAlert } from '@/shared/ui';

import { SETTING_NOT_CANCELLABLE_MESSAGE_KEY } from '../constants/setting-values.constants';
import { adminQueryKeys } from '../queries/admin.keys';
import { cancelSettingVersion } from '../services/cancel-setting-version.service';
import type { SettingVersion } from '../types/admin.types';

export interface CancelSettingVersionApi {
  readonly cancel: (version: SettingVersion, effectiveLabel: string) => void;
  readonly cancellingId: string | null;
}

/**
 * Cancel a scheduled version: confirm first (a cancelled change never takes
 * effect), and answer the backend's already-in-effect 409 with its own copy —
 * history is never rewritten, so the refusal is a fact, not a failure.
 */
export function useCancelSettingVersion(teamId: string): CancelSettingVersionApi {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const confirmAlert = useConfirmAlert();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const mutation = useInvalidatingMutation<null, string>({
    mutationFn: async (versionId) => {
      await cancelSettingVersion(teamId, versionId);
      return null;
    },
    invalidateKey: adminQueryKeys.settingsSnapshot(teamId),
    onSuccess: () => {
      setCancellingId(null);
      void toast.showToast({
        message: t(I18N_KEYS.settingHistory.cancelledToast),
        tone: 'success',
      });
    },
    onError: (error) => {
      setCancellingId(null);
      const notCancellable =
        isAppError(error) && error.messageKey === SETTING_NOT_CANCELLABLE_MESSAGE_KEY;
      void toast.showToast({
        message: t(
          notCancellable
            ? I18N_KEYS.settingHistory.cancelNotCancellable
            : I18N_KEYS.settingHistory.cancelFailedToast,
        ),
        tone: 'danger',
      });
    },
  });
  return {
    cancellingId,
    cancel: (version, effectiveLabel) => {
      void confirmAlert
        .confirm({
          header: t(I18N_KEYS.settingHistory.cancelConfirmTitle),
          message: t(I18N_KEYS.settingHistory.cancelConfirmMessage, { when: effectiveLabel }),
          confirmLabel: t(I18N_KEYS.settingHistory.cancelConfirmAction),
          cancelLabel: t(I18N_KEYS.settingHistory.cancelKeep),
        })
        .then((confirmed) => {
          if (confirmed) {
            setCancellingId(version.id);
            mutation.run(version.id);
          }
        });
    },
  };
}
