/**
 * Device-session management copy. Split out of the aggregate catalog so
 * I18N_KEYS stays within its size budget; validate-locales.mjs reads every
 * *keys.constants.ts.
 */
export const SESSIONS_I18N_KEYS = {
  title: 'sessions.title',
  intro: 'sessions.intro',
  current: 'sessions.current',
  lastActive: 'sessions.lastActive',
  revoke: 'sessions.revoke',
  revokeOthers: 'sessions.revokeOthers',
  revokedToast: 'sessions.revokedToast',
  revokeFailedToast: 'sessions.revokeFailedToast',
  emptyTitle: 'sessions.emptyTitle',
  emptyMessage: 'sessions.emptyMessage',
  unknownDevice: 'sessions.unknownDevice',
} as const;
