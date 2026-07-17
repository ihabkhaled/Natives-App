const DARK_PALETTE_CLASS = 'ion-palette-dark';

/** Toggle the Ionic dark palette on the document root. */
export function applyDocumentTheme(isDark: boolean): void {
  document.documentElement.classList.toggle(DARK_PALETTE_CLASS, isDark);
}

/** Apply language and direction to the document root for i18n/RTL. */
export function applyDocumentLocale(locale: string, direction: 'ltr' | 'rtl'): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = direction;
}
