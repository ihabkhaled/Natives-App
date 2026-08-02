import { useState } from 'react';

import { useSession } from '@/modules/auth';
import { useLocaleToggle, useThemeToggle } from '@/modules/settings';
import { tryoutRegistrationPath } from '@/modules/tryouts';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { APP_PATHS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import { resolvePublicShellVisibility } from '../public-shell-visibility.helper';
import type { PublicNavLink, PublicNavView } from './public-nav.types';

/**
 * Prepared view model for the signed-out marketing navbar. Visible on every
 * anonymous route (landing, welcome, login, forgot/reset password, about,
 * contact, tryout registration, and the 404 fallback); hidden the moment a
 * session resolves as authenticated, at which point the protected app bar
 * takes over.
 */
export function usePublicNav(): PublicNavView {
  const session = useSession();
  const theme = useThemeToggle();
  const locale = useLocaleToggle();
  const navigation = useAppNavigation();
  const { t } = useAppTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const rawLinks: readonly Omit<PublicNavLink, 'isActive'>[] = [
    { key: 'home', label: t(I18N_KEYS.publicNav.home), path: APP_PATHS.root },
    { key: 'about', label: t(I18N_KEYS.publicNav.about), path: APP_PATHS.about },
    { key: 'tryouts', label: t(I18N_KEYS.publicNav.tryouts), path: tryoutRegistrationPath() },
    { key: 'contact', label: t(I18N_KEYS.publicNav.contact), path: APP_PATHS.contact },
  ];

  const goTo = (path: string): void => {
    setIsMenuOpen(false);
    navigation.push(path);
  };

  return {
    isVisible: resolvePublicShellVisibility(session),
    ariaLabel: t(I18N_KEYS.publicNav.label),
    brandName: t(I18N_KEYS.common.appName),
    brandTagline: t(I18N_KEYS.brand.tagline),
    logoLabel: t(I18N_KEYS.brand.logoAlt),
    homePath: APP_PATHS.root,
    links: rawLinks.map((link) => ({
      ...link,
      isActive: navigation.currentPath === link.path,
    })),
    onNavigate: goTo,
    signInLabel: t(I18N_KEYS.publicNav.signIn),
    onSignIn: () => {
      goTo(APP_PATHS.login);
    },
    isDark: theme.isDark,
    themeToggleLabel: t(
      theme.isDark ? I18N_KEYS.publicNav.switchToLight : I18N_KEYS.publicNav.switchToDark,
    ),
    onToggleTheme: theme.toggle,
    isArabic: locale.isArabic,
    localeToggleLabel: t(
      locale.isArabic ? I18N_KEYS.publicNav.switchToEnglish : I18N_KEYS.publicNav.switchToArabic,
    ),
    onToggleLocale: locale.toggle,
    isMenuOpen,
    menuToggleLabel: t(isMenuOpen ? I18N_KEYS.publicNav.closeMenu : I18N_KEYS.publicNav.openMenu),
    onToggleMenu: () => {
      setIsMenuOpen((open) => !open);
    },
  };
}
