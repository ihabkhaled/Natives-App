import { useAppTranslation } from '@/packages/i18n';
import { useNetworkStatus } from '@/platform';
import { I18N_KEYS } from '@/shared/i18n';

export interface OfflineBannerView {
  readonly visible: boolean;
  readonly message: string;
}

export function useOfflineBanner(): OfflineBannerView {
  const network = useNetworkStatus();
  const { t } = useAppTranslation();
  return {
    visible: !network.isOnline,
    message: t(I18N_KEYS.states.offlineTitle),
  };
}
