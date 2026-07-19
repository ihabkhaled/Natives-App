import { useCurrentUserQuery, useLogoutMutation } from '@/modules/auth';
import { practicesPath } from '@/modules/practice';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { APP_PATHS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

export interface HomeScreenView {
  readonly title: string;
  readonly greeting: string;
  readonly userName: string | null;
  readonly avatarLabel: string;
  readonly isLoadingUser: boolean;
  readonly loadingLabel: string;
  readonly logoutLabel: string;
  readonly manageSessionsLabel: string;
  readonly practiceCalendarLabel: string;
  readonly isLoggingOut: boolean;
  readonly onLogout: () => void;
  readonly onManageSessions: () => void;
  readonly onOpenPracticeCalendar: () => void;
}

export function useHomeScreen(): HomeScreenView {
  const { t } = useAppTranslation();
  const currentUser = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const navigation = useAppNavigation();
  return {
    title: t(I18N_KEYS.home.title),
    greeting: t(I18N_KEYS.home.greeting, { name: currentUser.user?.displayName ?? '' }),
    userName: currentUser.user?.displayName ?? null,
    avatarLabel: t(I18N_KEYS.nav.profileLabel),
    isLoadingUser: currentUser.isLoading,
    loadingLabel: t(I18N_KEYS.common.loading),
    logoutLabel: t(I18N_KEYS.home.logout),
    manageSessionsLabel: t(I18N_KEYS.home.manageSessions),
    practiceCalendarLabel: t(I18N_KEYS.practice.entryLink),
    isLoggingOut: logoutMutation.isLoggingOut,
    onLogout: logoutMutation.logout,
    onManageSessions: () => {
      navigation.push(APP_PATHS.sessions);
    },
    onOpenPracticeCalendar: () => {
      navigation.push(practicesPath());
    },
  };
}
