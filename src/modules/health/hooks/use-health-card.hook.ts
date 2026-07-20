import { formatDateTime } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';

import { useHealthQuery } from './use-health-query.hook';

export interface HealthCardView {
  readonly title: string;
  readonly isLoading: boolean;
  readonly loadingLabel: string;
  readonly errorMessage: string | undefined;
  readonly retryLabel: string;
  readonly statusLabel: string;
  readonly isHealthy: boolean;
  readonly versionLabel: string;
  readonly version: string | null;
  readonly checkedAtLabel: string;
  readonly checkedAtText: string;
  readonly onRefresh: () => void;
}

/** Prepared, translated view model for the health card. */
export function useHealthCard(): HealthCardView {
  const { t, locale } = useAppTranslation();
  const healthQuery = useHealthQuery();
  const health = healthQuery.health;
  return {
    title: t(I18N_KEYS.health.title),
    isLoading: healthQuery.isLoading,
    loadingLabel: t(I18N_KEYS.common.loading),
    errorMessage:
      healthQuery.error === null ? undefined : t(mapErrorCodeToI18nKey(healthQuery.error.code)),
    retryLabel: t(I18N_KEYS.common.retry),
    statusLabel:
      health?.isHealthy === true ? t(I18N_KEYS.health.statusUp) : t(I18N_KEYS.health.statusDown),
    isHealthy: health?.isHealthy === true,
    versionLabel: t(I18N_KEYS.health.version),
    version: health?.version ?? null,
    checkedAtLabel: t(I18N_KEYS.health.checkedAt),
    checkedAtText: health === undefined ? '' : formatDateTime(health.checkedAtIso, locale),
    onRefresh: healthQuery.refetch,
  };
}
