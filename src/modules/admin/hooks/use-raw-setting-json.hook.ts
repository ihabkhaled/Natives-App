import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import type { SettingKey } from '../constants/admin.constants';
import { parseRawSettingJson } from '../helpers/setting-form.helper';
import { buildRawJsonView } from '../helpers/setting-form-view.helper';
import type { RawJsonFormView } from '../types/admin-view.types';
import type { TypedSettingValue } from '../types/setting-values.types';

/**
 * The privileged raw-JSON fallback (D10): a disclosure only a platform
 * administrator sees, validated through the same per-key schema before it
 * may replace the typed draft — an affordance, never a validation bypass.
 */
export function useRawSettingJson(
  settingKey: SettingKey,
  enabled: boolean,
  applyDraft: (value: TypedSettingValue) => void,
): RawJsonFormView | null {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const [isOpen, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  if (!enabled) {
    return null;
  }
  return buildRawJsonView({
    t,
    isOpen,
    text,
    error,
    onToggle: () => {
      setOpen((open) => !open);
    },
    onTextChange: (value) => {
      setText(value);
      setError(null);
    },
    onApply: () => {
      const parsed = parseRawSettingJson(settingKey, text);
      if (parsed.ok) {
        applyDraft(parsed.value);
        setError(null);
        void toast.showToast({ message: t(I18N_KEYS.settingForm.rawApplied), tone: 'success' });
      } else {
        setError(t(I18N_KEYS.settingForm.rawInvalid));
      }
    },
  });
}
