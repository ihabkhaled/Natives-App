/**
 * Signed-in landing copy. Split out of the aggregate catalog so I18N_KEYS
 * stays within its size budget; validate-locales.mjs reads every
 * *keys.constants.ts.
 */
export const HOME_I18N_KEYS = {
  title: 'home.title',
  greeting: 'home.greeting',
  manageSessions: 'home.manageSessions',
  noAccessTitle: 'home.noAccessTitle',
  noAccessMessage: 'home.noAccessMessage',
} as const;
