/**
 * Error copy keys. Split out of the aggregate catalog so I18N_KEYS stays
 * within its size budget; validate-locales.mjs reads every *keys.constants.ts.
 */
export const ERRORS_I18N_KEYS = {
  network: 'errors.network',
  timeout: 'errors.timeout',
  unauthorized: 'errors.unauthorized',
  forbidden: 'errors.forbidden',
  notFound: 'errors.notFound',
  conflict: 'errors.conflict',
  rateLimited: 'errors.rateLimited',
  validation: 'errors.validation',
  server: 'errors.server',
  unexpected: 'errors.unexpected',
  invalidCredentials: 'errors.invalidCredentials',
  sessionExpired: 'errors.sessionExpired',
  deepLinkRejected: 'errors.deepLinkRejected',
  linkInvalidOrExpired: 'errors.linkInvalidOrExpired',
  /** Backend-namespaced practice-domain message keys the UI renders as copy. */
  practices: {
    checkInWindowClosed: 'errors.practices.checkInWindowClosed',
    attendanceRuleMissing: 'errors.practices.attendanceRuleMissing',
  },
} as const;
