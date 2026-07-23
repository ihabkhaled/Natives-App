import { formatCairoDateTime, nowIso } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { ADMIN_SETTINGS_COPY } from '../constants/admin-labels.constants';
import { buildAdminScreenCopy, resolveAdminScreenStatus } from '../helpers/admin-copy.helper';
import { buildEditorContextBase } from '../helpers/setting-editor-labels.helper';
import { buildSettingHistory, resolveHeadVersionId } from '../helpers/setting-history.helper';
import { buildSettingsLabels, describeAsOf } from '../helpers/settings-labels.helper';
import { buildSettingsRowGroups } from '../helpers/settings-rows.helper';
import type { AdminSettingsView } from '../types/admin-view.types';
import { useAdminContext } from './use-admin-context.hook';
import { useCancelSettingVersion } from './use-cancel-setting-version.hook';
import { useEffectiveInstant } from './use-effective-instant.hook';
import { useSettingsResources } from './use-settings-resources.hook';
import { useSettingsSelection } from './use-settings-selection.hook';
import { useSettingVersionForm } from './use-setting-version-form.hook';
import { useWeightRows } from './use-weight-rows.hook';

/**
 * Team settings: the readable effective snapshot, the selected key's diffed
 * history with cancel, the typed scheduling form (only for a principal who
 * may write), and the reference data the rest of the app selects from.
 */
export function useAdminSettings(): AdminSettingsView {
  const { t, locale } = useAppTranslation();
  const context = useAdminContext();
  const selection = useSettingsSelection();
  const resources = useSettingsResources(context.teamId, selection.settingKey, selection.catalog);
  const formatInstant = (iso: string): string => formatCairoDateTime(iso, locale);
  const snapshot = resources.snapshot;
  const settings = snapshot.data?.settings ?? [];
  const versionItems = resources.versions.data?.items ?? [];
  const instant = useEffectiveInstant();
  const weights = useWeightRows(
    context.teamId,
    selection.settingKey,
    instant.utcIso,
    settings.find((setting) => setting.settingKey === 'attendance_statuses'),
  );
  const form = useSettingVersionForm(context.teamId, {
    settingKey: selection.settingKey,
    effective: settings.find((setting) => setting.settingKey === selection.settingKey),
    headVersionId: resolveHeadVersionId(versionItems),
    canUseRawJson: context.canManagePlatform,
    instant,
    weights,
    contextBase: buildEditorContextBase(t, resources.positions.data ?? []),
  });
  const cancelApi = useCancelSettingVersion(context.teamId);

  return {
    ...buildAdminScreenCopy(t, {
      keys: ADMIN_SETTINGS_COPY,
      error: snapshot.error,
      isOffline: context.isOffline,
      onRetry: snapshot.refetch,
      emptyTitleKey: I18N_KEYS.adminSettings.emptyTitle,
      emptyMessageKey: I18N_KEYS.adminSettings.emptyMessage,
    }),
    ...buildSettingsLabels(t),
    status: resolveAdminScreenStatus(
      context,
      snapshot,
      context.canReadSettings,
      settings.length > 0,
    ),
    readOnlyNotice: context.canManageSettings ? null : t(I18N_KEYS.adminSettings.readOnlyNotice),
    asOfLabel: describeAsOf(t, formatInstant, snapshot.data),
    ...buildSettingsRowGroups(t, formatInstant, {
      settings,
      seasons: resources.seasons.data,
      venues: resources.venues.data,
      catalog: resources.catalog.data,
    }),
    history: buildSettingHistory(
      {
        t,
        formatInstant,
        nowIso: nowIso(),
        canManage: context.canManageSettings,
        cancellingId: cancelApi.cancellingId,
        onCancel: (version) => {
          cancelApi.cancel(version, formatInstant(version.effectiveFrom));
        },
        onReplace: form.onPrepareReplacement,
      },
      versionItems,
    ),
    settingKey: selection.settingKey,
    versionForm: context.canManageSettings ? form : null,
    catalog: selection.catalog,
    onSettingKeyChange: selection.setSettingKey,
    onCatalogChange: selection.setCatalog,
  };
}
