import { QueryClient } from '@tanstack/react-query';

import { isTransientFailure } from './helpers/transient-failure.helper';

const RETRYABLE_MAX_ATTEMPTS = 2;

/**
 * Retry only transient failures (network drops, timeouts, 5xx, 408, 429), and
 * only within the attempt budget. Deterministic answers — 401/403/404,
 * validation, conflicts, and anything unrecognized — surface immediately so a
 * forbidden or missing screen never fakes several seconds of "Loading…".
 */
function isRetryableFailure(failureCount: number, error: unknown): boolean {
  return failureCount < RETRYABLE_MAX_ATTEMPTS && isTransientFailure(error);
}

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: isRetryableFailure,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
