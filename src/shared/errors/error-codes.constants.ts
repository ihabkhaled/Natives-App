/**
 * Application error taxonomy. Every failure surfaced to the UI must be an
 * AppError carrying one of these codes; raw backend or vendor errors never
 * reach users (rules/17-error-handling.md).
 */
export const APP_ERROR_CODE = {
  NetworkOffline: 'NETWORK_OFFLINE',
  Timeout: 'TIMEOUT',
  Unauthorized: 'UNAUTHORIZED',
  Forbidden: 'FORBIDDEN',
  NotFound: 'NOT_FOUND',
  Conflict: 'CONFLICT',
  RateLimited: 'RATE_LIMITED',
  Validation: 'VALIDATION_ERROR',
  Server: 'SERVER_ERROR',
  Unexpected: 'UNEXPECTED_ERROR',
  InvalidCredentials: 'INVALID_CREDENTIALS',
  SessionExpired: 'SESSION_EXPIRED',
  DeepLinkRejected: 'DEEP_LINK_REJECTED',
  LinkInvalidOrExpired: 'LINK_INVALID_OR_EXPIRED',
} as const;

export type AppErrorCode = (typeof APP_ERROR_CODE)[keyof typeof APP_ERROR_CODE];
