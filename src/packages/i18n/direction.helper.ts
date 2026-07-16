const RTL_LANGUAGE_CODES: readonly string[] = ['ar', 'fa', 'he', 'ur'];

export type LayoutDirection = 'ltr' | 'rtl';

export function localeToDirection(locale: string): LayoutDirection {
  const language = locale.toLowerCase().split('-')[0] ?? '';
  return RTL_LANGUAGE_CODES.includes(language) ? 'rtl' : 'ltr';
}
