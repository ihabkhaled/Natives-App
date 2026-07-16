export const APP_LOCALE = {
  English: 'en',
  Arabic: 'ar',
} as const;

export type AppLocale = (typeof APP_LOCALE)[keyof typeof APP_LOCALE];

export const APP_LOCALES: readonly AppLocale[] = Object.values(APP_LOCALE);
