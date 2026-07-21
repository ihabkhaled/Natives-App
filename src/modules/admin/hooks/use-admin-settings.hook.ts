import { formatCairoDateTime } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { ADMIN_SETTINGS_COPY } from '../constants/admin-labels.constants';
import { buildAdminScreenCopy, resolveAdminScreenStatus } from '../helpers/admin-copy.helper';
import { buildSettingsLabels, describeAsOf } from '../helpers/settings-labels.helper';
import { buildSettingsRowGroups } from '../helpers/settings-rows.helper';
import type { AdminSettingsView } from '../types/admin-view.types';
import { useAdminContext } from './use-admin-context.hook';
import { useSettingsResources } from './use-settings-resources.hook';
import { useSettingsSelection } from './use-settings-selection.hook';
import { useSettingVersionForm } from './use-setting-version-form.hook';

/**
 * Team settings: the effective snapshot, the selected key's version history,
 * the scheduling form (only for a principal who may write), and the reference
 * data the rest of the app selects from.
 */
export function useAdminSettings(): AdminSettingsView {
  const { t, locale } = useAppTranslation();
  const context = useAdminContext();
  const selection = useSettingsSelection();
  const resources = useSettingsResources(context.teamId, selection.settingKey, selection.catalog);
  const form = useSettingVersionForm(context.teamId, selection.settingKey);
  const formatInstant = (iso: string): string => formatCairoDateTime(iso, locale);
  const snapshot = resources.snapshot;

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
      (snapshot.data?.settings.length ?? 0) > 0,
    ),
    readOnlyNotice: context.canManageSettings ? null : t(I18N_KEYS.adminSettings.readOnlyNotice),
    asOfLabel: describeAsOf(t, formatInstant, snapshot.data),
    ...buildSettingsRowGroups(t, formatInstant, {
      settings: snapshot.data?.settings,
      versions: resources.versions.data?.items,
      seasons: resources.seasons.data,
      venues: resources.venues.data,
      catalog: resources.catalog.data,
    }),
    settingKey: selection.settingKey,
    versionForm: context.canManageSettings ? form : null,
    catalog: selection.catalog,
    onSettingKeyChange: selection.setSettingKey,
    onCatalogChange: selection.setCatalog,
  };
}
