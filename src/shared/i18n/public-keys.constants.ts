/**
 * Signed-out marketing shell (public navbar + footer) copy. Split out of the
 * aggregate catalog so I18N_KEYS stays within its size budget;
 * validate-locales.mjs reads every *keys.constants.ts.
 */
export const PUBLIC_NAV_I18N_KEYS = {
  label: 'publicNav.label',
  openMenu: 'publicNav.openMenu',
  closeMenu: 'publicNav.closeMenu',
  home: 'publicNav.home',
  about: 'publicNav.about',
  team: 'publicNav.team',
  tryouts: 'publicNav.tryouts',
  contact: 'publicNav.contact',
  signIn: 'publicNav.signIn',
  signUp: 'publicNav.signUp',
  switchToDark: 'publicNav.switchToDark',
  switchToLight: 'publicNav.switchToLight',
  switchToArabic: 'publicNav.switchToArabic',
  switchToEnglish: 'publicNav.switchToEnglish',
} as const;

export const PUBLIC_FOOTER_I18N_KEYS = {
  label: 'publicFooter.label',
  tagline: 'publicFooter.tagline',
  navHeading: 'publicFooter.navHeading',
  socialHeading: 'publicFooter.socialHeading',
  facebookLabel: 'publicFooter.facebookLabel',
  instagramLabel: 'publicFooter.instagramLabel',
  tiktokLabel: 'publicFooter.tiktokLabel',
  copyright: 'publicFooter.copyright',
} as const;
