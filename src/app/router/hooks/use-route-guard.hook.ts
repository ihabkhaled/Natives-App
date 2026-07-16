import { useSession } from '@/modules/auth';
import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

export interface RouteGuardView {
  readonly isResolved: boolean;
  readonly isAuthenticated: boolean;
  readonly loadingLabel: string;
}

export function useRouteGuard(): RouteGuardView {
  const session = useSession();
  const { t } = useAppTranslation();
  return {
    isResolved: session.isResolved,
    isAuthenticated: session.isAuthenticated,
    loadingLabel: t(I18N_KEYS.common.loading),
  };
}
