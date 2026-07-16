import { QueryClient } from '@tanstack/react-query';

const RETRYABLE_MAX_ATTEMPTS = 2;

function isRetryableFailure(failureCount: number, error: unknown): boolean {
  if (failureCount >= RETRYABLE_MAX_ATTEMPTS) {
    return false;
  }
  const status = (error as { status?: number }).status;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    return false;
  }
  return true;
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
