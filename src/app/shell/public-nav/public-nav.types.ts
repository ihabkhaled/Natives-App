/** One destination in the public navbar / drawer. */
export interface PublicNavLink {
  readonly key: string;
  readonly label: string;
  readonly path: string;
  readonly isActive: boolean;
}

/** Prepared, translated view model for the signed-out marketing navbar. */
export interface PublicNavView {
  readonly isVisible: boolean;
  readonly ariaLabel: string;
  readonly brandName: string;
  readonly brandTagline: string;
  readonly logoLabel: string;
  readonly homePath: string;
  readonly links: readonly PublicNavLink[];
  readonly onNavigate: (path: string) => void;
  readonly signInLabel: string;
  readonly onSignIn: () => void;
  readonly signUpLabel: string;
  readonly onSignUp: () => void;
  readonly isDark: boolean;
  readonly themeToggleLabel: string;
  readonly onToggleTheme: () => void;
  readonly isArabic: boolean;
  readonly localeToggleLabel: string;
  readonly onToggleLocale: () => void;
  readonly isMenuOpen: boolean;
  readonly menuToggleLabel: string;
  readonly onToggleMenu: () => void;
}
