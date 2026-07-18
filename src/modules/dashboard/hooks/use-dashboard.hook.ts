import { useEffectivePermissions } from '@/modules/auth';
import { formatDateTime } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useNetworkStatus } from '@/platform';
import { I18N_KEYS } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';

import { DASHBOARD_PERSONA_TITLE_KEYS } from '../constants/dashboard-widgets.constants';
import {
  buildDashboardWidgetViews,
  resolveDashboardStatus,
} from '../helpers/dashboard-view-model.helper';
import type { DashboardView } from '../types/dashboard-view.types';
import { useDashboardSummaryQuery } from './use-dashboard-summary-query.hook';

/**
 * Prepared, translated view model for the personalized dashboard. Composes the
 * summary projection, the effective permissions, and connectivity into a single
 * permission-aware, freshness-aware, offline-aware view.
 */
export function useDashboard(): DashboardView {
  const { t, locale } = useAppTranslation();
  const query = useDashboardSummaryQuery();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();

  const summary = query.summary;
  const widgets =
    summary === undefined
      ? []
      : buildDashboardWidgetViews(summary.widgets, permissions.permissions, t, locale);
  const isOffline = !network.isOnline;
  const status = resolveDashboardStatus({
    hasSummary: summary !== undefined,
    hasWidgets: widgets.length > 0,
    isLoading: query.isLoading || permissions.isLoading,
    hasError: query.error !== null,
    isOffline,
  });

  return {
    title:
      summary === undefined
        ? t(I18N_KEYS.dashboard.title)
        : t(DASHBOARD_PERSONA_TITLE_KEYS[summary.persona]),
    updatedLabel:
      summary === undefined
        ? null
        : t(I18N_KEYS.dashboard.updatedAt, {
            when: formatDateTime(summary.generatedAtIso, locale),
          }),
    status,
    loadingLabel: t(I18N_KEYS.common.loading),
    errorTitle: t(I18N_KEYS.states.errorTitle),
    errorMessage: query.error === null ? '' : t(mapErrorCodeToI18nKey(query.error.code)),
    retryLabel: t(I18N_KEYS.common.retry),
    onRetry: query.refetch,
    offlineTitle: t(I18N_KEYS.states.offlineTitle),
    offlineMessage: t(I18N_KEYS.states.offlineMessage),
    offlineNoticeLabel: t(I18N_KEYS.dashboard.offlineNotice),
    isOffline,
    emptyTitle: t(I18N_KEYS.dashboard.emptyTitle),
    emptyMessage: t(I18N_KEYS.dashboard.emptyMessage),
    widgets,
  };
}
