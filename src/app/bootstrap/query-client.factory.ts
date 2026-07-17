import { createAppQueryClient, type QueryClient } from '@/packages/query';

let cachedQueryClient: QueryClient | null = null;

/** App-wide QueryClient singleton (reset only in tests). */
export function getAppQueryClient(): QueryClient {
  cachedQueryClient ??= createAppQueryClient();
  return cachedQueryClient;
}

export function resetAppQueryClientForTesting(): void {
  cachedQueryClient = null;
}
