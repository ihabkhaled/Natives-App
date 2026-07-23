import { useAppTranslation } from '@/packages/i18n';
import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { describeSubmitError } from '../helpers/setting-form.helper';
import { adminQueryKeys } from '../queries/admin.keys';
import { createSettingVersion } from '../services/create-setting-version.service';
import type { CreateSettingVersionCommand } from '../types/admin.types';

/**
 * The schedule-change mutation. Every outcome refreshes the settings cache
 * branch (snapshot + versions), so a stale-409 leaves the admin looking at
 * the refreshed history the guard asked them to review before re-confirming.
 */
export function useCreateSettingVersion(
  teamId: string,
  onSaved: () => void,
): InvalidatingMutationView<CreateSettingVersionCommand> {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  return useInvalidatingMutation<string, CreateSettingVersionCommand>({
    mutationFn: (command) => createSettingVersion(teamId, command),
    invalidateKey: adminQueryKeys.settingsSnapshot(teamId),
    onSuccess: () => {
      onSaved();
      void toast.showToast({
        message: t(I18N_KEYS.adminSettings.addVersionSavedToast),
        tone: 'success',
      });
    },
    onError: (error) => {
      void toast.showToast({ message: describeSubmitError(t, error), tone: 'danger' });
    },
  });
}
