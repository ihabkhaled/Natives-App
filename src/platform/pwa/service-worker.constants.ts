export const PWA_SERVICE_WORKER_URL = '/service-worker.js';
export const PWA_SERVICE_WORKER_SCOPE = '/';
export const PWA_SKIP_WAITING_MESSAGE = { type: 'SKIP_WAITING' } as const;

export const PWA_UPDATE_APPLY_RESULT = {
  Requested: 'requested',
  Blocked: 'blocked',
  Unavailable: 'unavailable',
  Failed: 'failed',
} as const;
