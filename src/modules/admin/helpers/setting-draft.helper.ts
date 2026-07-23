import { safeParseWithSchema } from '@/packages/schema';

import type { SettingEditorBinding } from '../components/setting-editors/setting-editors.types';
import type { SettingKey } from '../constants/admin.constants';
import { settingValueSchemas } from '../schemas/setting-values.schema';
import type { SettingValueByKey, TypedSettingValue } from '../types/setting-values.types';

type DraftFactories = { readonly [K in SettingKey]: () => SettingValueByKey[K] };

/**
 * A minimal *valid-by-intent* starting document per key: the poles a sheet
 * needs, one session type, one tier — so the editor opens with structure, and
 * the remaining blanks are guided by the live validation list. Default labels
 * are stored data (bilingual), not UI copy, so they live here rather than in
 * the i18n catalog.
 */
const DRAFT_FACTORIES: DraftFactories = {
  attendance_statuses: () => ({
    statuses: [
      {
        code: 'present_on_time',
        labelEn: 'On time',
        labelAr: 'في الموعد',
        color: 'success',
        countsTowardMetrics: true,
        allowSelfCheckIn: true,
        active: true,
      },
      {
        code: 'absent',
        labelEn: 'Absent',
        labelAr: 'غائب',
        color: 'danger',
        countsTowardMetrics: true,
        allowSelfCheckIn: false,
        active: true,
      },
    ],
  }),
  session_types: () => ({
    types: [
      { code: 'practice', labelEn: 'Practice', labelAr: 'تدريب', color: 'primary', active: true },
    ],
  }),
  attendance_weights: () => ({ weights: {} }),
  assessment_scale: () => ({ min: 1, max: 5, step: 1 }),
  badge_tiers: () => ({
    tiers: [
      { key: 'bronze', labelEn: 'Bronze', labelAr: 'برونزي', threshold: 100, color: 'accent2' },
    ],
  }),
  roster_limits: () => ({ roster: { max: 27 } }),
  notification_rules: () => ({
    rules: [
      {
        event: 'practice_reminder',
        enabled: false,
        channels: [],
        leadHours: 24,
        recipients: 'members',
      },
      { event: 'practice_change', enabled: false, channels: [], recipients: 'members' },
      { event: 'attendance_finalized', enabled: false, channels: [], recipients: 'staff' },
      { event: 'badge_awarded', enabled: false, channels: [], recipients: 'members' },
    ],
  }),
  report_branding: () => ({ displayName: '' }),
};

export function emptySettingValue<K extends SettingKey>(key: K): SettingValueByKey[K] {
  return DRAFT_FACTORIES[key]();
}

/**
 * The draft a key's editor opens with: the effective value when one exists
 * and still parses, otherwise the empty starting document. Re-parsing through
 * the key's own schema narrows the union without a cast.
 */
export function draftFromEffective<K extends SettingKey>(
  key: K,
  effective: TypedSettingValue | null,
): SettingValueByKey[K] {
  if (effective !== null) {
    const parsed = safeParseWithSchema(settingValueSchemas[key], effective);
    if (parsed.success) {
      return parsed.data;
    }
  }
  return emptySettingValue(key);
}

/**
 * Assemble the discriminated editor binding. Sound by construction: the
 * draft for `key` is always produced by that key's own factory or schema
 * (draftFromEffective / the editor's typed onChange), so the correlation the
 * assertion states is maintained at every call site.
 */
export function bindSettingEditor(
  key: SettingKey,
  value: TypedSettingValue,
  onChange: (next: TypedSettingValue) => void,
): SettingEditorBinding {
  return { settingKey: key, value, onChange } as SettingEditorBinding;
}
