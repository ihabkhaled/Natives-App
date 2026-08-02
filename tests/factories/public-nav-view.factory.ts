import { vi } from 'vitest';

import type { PublicNavView } from '@/app/shell/public-nav/public-nav.types';

/** Deterministic public-nav view model shared by the container and component tests. */
export function buildPublicNavView(overrides: Partial<PublicNavView> = {}): PublicNavView {
  return {
    isVisible: true,
    ariaLabel: 'Public site navigation',
    brandName: 'Ultimate Natives',
    brandTagline: 'Elite ultimate. One community.',
    logoLabel: 'Ultimate Natives logo',
    homePath: '/welcome',
    links: [
      { key: 'home', label: 'Home', path: '/welcome', isActive: true },
      { key: 'about', label: 'About', path: '/about', isActive: false },
      { key: 'tryouts', label: 'Tryouts', path: '/tryout-registration', isActive: false },
      { key: 'contact', label: 'Contact', path: '/contact', isActive: false },
    ],
    onNavigate: vi.fn(),
    signInLabel: 'Sign in',
    onSignIn: vi.fn(),
    signUpLabel: 'Create an account',
    onSignUp: vi.fn(),
    isDark: false,
    themeToggleLabel: 'Switch to dark theme',
    onToggleTheme: vi.fn(),
    isArabic: false,
    localeToggleLabel: 'View in Arabic',
    onToggleLocale: vi.fn(),
    isMenuOpen: false,
    menuToggleLabel: 'Open menu',
    onToggleMenu: vi.fn(),
    ...overrides,
  };
}
