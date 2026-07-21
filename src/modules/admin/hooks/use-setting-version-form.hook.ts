import { useState } from 'react';

import { nowIso } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useInvalidatingMutation } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { ADMIN_LIMITS, type SettingKey } from '../constants/admin.constants';
import { parseSettingValue } from '../helpers/setting-value.helper';
import { adminQueryKeys } from '../queries/admin.keys';
import { createSettingVersion } from '../services/create-setting-version.service';
import type { CreateSettingVersionCommand } from '../types/admin.types';
import type { SettingVersionFormView } from '../types/admin-view.types';

interface Draft {
  readonly effectiveFrom: string;
  readonly value: string;
  readonly note: string;
}

/**
 * The effective-dated change form. A malformed value or a missing reason
 * blocks the submit here rather than being sent and rejected — the reason is
 * required because the change lands in the audit log.
 */
export function useSettingVersionForm(teamId: string, settingKey: string): SettingVersionFormView {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const [draft, setDraft] = useState<Draft>({ effectiveFrom: nowIso(), value: '{}', note: '' });
  const mutation = useInvalidatingMutation<string, CreateSettingVersionCommand>({
    mutationFn: (command) => createSettingVersion(teamId, command),
    invalidateKey: adminQueryKeys.settingsSnapshot(teamId),
    onSuccess: () => {
      void toast.showToast({
        message: t(I18N_KEYS.adminSettings.addVersionSavedToast),
        tone: 'success',
      });
    },
    onError: () => {
      void toast.showToast({
        message: t(I18N_KEYS.adminSettings.addVersionFailedToast),
        tone: 'danger',
      });
    },
  });

  const parsed = parseSettingValue(draft.value);
  const reasonOk = draft.note.trim().length >= ADMIN_LIMITS.minimumReasonLength;
  const validationMessage = !parsed.ok
    ? t(I18N_KEYS.adminSettings.addVersionInvalidValue)
    : reasonOk
      ? null
      : t(I18N_KEYS.adminSettings.addVersionInvalidReason);

  return {
    heading: t(I18N_KEYS.adminSettings.addVersionHeading),
    intro: t(I18N_KEYS.adminSettings.addVersionIntro),
    effectiveFromLabel: t(I18N_KEYS.adminSettings.addVersionEffectiveFrom),
    effectiveFromValue: draft.effectiveFrom,
    valueLabel: t(I18N_KEYS.adminSettings.addVersionValue),
    valueValue: draft.value,
    noteLabel: t(I18N_KEYS.adminSettings.addVersionNote),
    noteValue: draft.note,
    validationMessage,
    submitLabel: t(I18N_KEYS.adminSettings.addVersionSubmit),
    isSaving: mutation.isRunning,
    canSubmit: validationMessage === null && !mutation.isRunning,
    onEffectiveFromChange: (value: string) => {
      setDraft((current) => ({ ...current, effectiveFrom: value }));
    },
    onValueChange: (value: string) => {
      setDraft((current) => ({ ...current, value }));
    },
    onNoteChange: (note: string) => {
      setDraft((current) => ({ ...current, note }));
    },
    onSubmit: () => {
      if (validationMessage === null) {
        mutation.run({
          settingKey: settingKey as SettingKey,
          effectiveFrom: draft.effectiveFrom,
          value: parsed.value,
          note: draft.note.trim(),
        });
      }
    },
  };
}
