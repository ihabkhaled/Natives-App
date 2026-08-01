/**
 * Signed-out marketing shell (public navbar + footer) and marketing page test
 * ids. Split out of the aggregate catalog so TEST_IDS stays within its size
 * budget.
 */
export const PUBLIC_TEST_IDS = {
  publicNav: 'public-nav',
  publicNavBrand: 'public-nav-brand',
  publicNavLink: 'public-nav-link',
  publicNavThemeToggle: 'public-nav-theme-toggle',
  publicNavLocaleToggle: 'public-nav-locale-toggle',
  publicNavMenuButton: 'public-nav-menu-button',
  publicNavDrawer: 'public-nav-drawer',
  publicNavSignIn: 'public-nav-sign-in',
  publicNavSignInDrawer: 'public-nav-sign-in-drawer',
  publicFooter: 'public-footer',
  publicFooterLink: 'public-footer-link',
  publicFooterSocialLink: 'public-footer-social-link',
} as const;
