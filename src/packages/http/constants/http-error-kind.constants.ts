export const HTTP_ERROR_KIND = {
  Network: 'network',
  Timeout: 'timeout',
  Cancelled: 'cancelled',
  Unauthorized: 'unauthorized',
  Forbidden: 'forbidden',
  NotFound: 'not-found',
  Conflict: 'conflict',
  RateLimited: 'rate-limited',
  Validation: 'validation',
  Server: 'server',
  ResponseContract: 'response-contract',
  Unexpected: 'unexpected',
} as const;

export type HttpErrorKind = (typeof HTTP_ERROR_KIND)[keyof typeof HTTP_ERROR_KIND];
