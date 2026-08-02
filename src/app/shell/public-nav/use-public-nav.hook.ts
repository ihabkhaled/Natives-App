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
    // The primary spine of the marketing site. The remaining pages (spirit,
    // gallery, location, at-a-glance) are secondary and live in the footer, so
    // the bar stays legible on a phone.
    { key: 'home', label: t(I18N_KEYS.publicNav.home), path: APP_PATHS.root },
    { key: 'ultimate', label: t(I18N_KEYS.publicNav.ultimate), path: APP_PATHS.ultimate },
    { key: 'about', label: t(I18N_KEYS.publicNav.about), path: APP_PATHS.about },
    { key: 'team', label: t(I18N_KEYS.publicNav.team), path: APP_PATHS.team },
    { key: 'results', label: t(I18N_KEYS.publicNav.results), path: APP_PATHS.publicCompetitions },
    { key: 'news', label: t(I18N_KEYS.publicNav.news), path: APP_PATHS.news },
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
    signUpLabel: t(I18N_KEYS.publicNav.signUp),
    onSignUp: () => {
      goTo(APP_PATHS.signup);
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
