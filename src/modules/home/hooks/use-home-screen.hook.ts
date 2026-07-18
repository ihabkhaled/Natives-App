import { useCurrentUserQuery, useLogoutMutation } from '@/modules/auth';
import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

export interface HomeScreenView {
  readonly title: string;
  readonly greeting: string;
  readonly isLoadingUser: boolean;
  readonly loadingLabel: string;
  readonly logoutLabel: string;
  readonly manageSessionsLabel: string;
  readonly practiceCalendarLabel: string;
  readonly isLoggingOut: boolean;
  readonly onLogout: () => void;
}

export function useHomeScreen(): HomeScreenView {
  const { t } = useAppTranslation();
  const currentUser = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  return {
    title: t(I18N_KEYS.home.title),
    greeting: t(I18N_KEYS.home.greeting, { name: currentUser.user?.displayName ?? '' }),
    isLoadingUser: currentUser.isLoading,
    loadingLabel: t(I18N_KEYS.common.loading),
    logoutLabel: t(I18N_KEYS.home.logout),
    manageSessionsLabel: t(I18N_KEYS.home.manageSessions),
    practiceCalendarLabel: t(I18N_KEYS.practice.entryLink),
    isLoggingOut: logoutMutation.isLoggingOut,
    onLogout: logoutMutation.logout,
  };
}
