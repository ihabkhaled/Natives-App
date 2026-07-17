const RTL_LANGUAGE_CODES: readonly string[] = ['ar', 'fa', 'he', 'ur'];

export type LayoutDirection = 'ltr' | 'rtl';

export function localeToDirection(locale: string): LayoutDirection {
  const separatorIndex = locale.indexOf('-');
  const language = (separatorIndex === -1 ? locale : locale.slice(0, separatorIndex)).toLowerCase();
  return RTL_LANGUAGE_CODES.includes(language) ? 'rtl' : 'ltr';
}
