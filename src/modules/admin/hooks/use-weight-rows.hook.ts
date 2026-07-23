import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';

import type { WeightsEditorContext } from '../components/setting-editors/setting-editors.types';
import type { SettingKey } from '../constants/admin.constants';
import { buildWeightsContext } from '../helpers/setting-form-view.helper';
import { buildSettingsSnapshotAtQueryOptions } from '../queries/admin.query';
import type { EffectiveSetting, SettingsSnapshot } from '../types/admin.types';

/**
 * The weights editor's derived rows: the active counts-toward statuses
 * effective at the chosen instant, resolved through the as-of snapshot. When
 * no instant is chosen yet the current snapshot stands in, so the editor is
 * useful before a date is picked and truthful after.
 */
export function useWeightRows(
  teamId: string,
  settingKey: SettingKey,
  asOfIso: string,
  statusesNow: EffectiveSetting | undefined,
): WeightsEditorContext {
  const { t, locale } = useAppTranslation();
  const enabled = settingKey === 'attendance_weights' && asOfIso !== '';
  const asOfQuery = useAppQuery<SettingsSnapshot>(
    buildSettingsSnapshotAtQueryOptions(teamId, enabled ? asOfIso : ''),
  );
  return buildWeightsContext({
    t,
    locale,
    settingKey,
    enabled,
    isPending: asOfQuery.isPending,
    asOfSettings: asOfQuery.data?.settings,
    statusesNow,
  });
}
