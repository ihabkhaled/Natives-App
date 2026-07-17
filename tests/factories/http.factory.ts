import {
  configureAppHttpClient,
  createHttpClient,
  createTestAdapter,
  type TestRoute,
  type TokenPair,
  type TokenStore,
} from '@/packages/http';

export interface MemoryTokenStore extends TokenStore {
  readonly snapshot: () => TokenPair | null;
}

/** In-memory TokenStore double for HTTP owner and auth tests. */
export function createMemoryTokenStore(initial: TokenPair | null = null): MemoryTokenStore {
  let tokens: TokenPair | null = initial;
  return {
    getAccessToken: () => Promise.resolve(tokens?.accessToken ?? null),
    getRefreshToken: () => Promise.resolve(tokens?.refreshToken ?? null),
    setTokens: (next) => {
      tokens = next;
      return Promise.resolve();
    },
    clearTokens: () => {
      tokens = null;
      return Promise.resolve();
    },
    snapshot: () => tokens,
  };
}

export function buildTokenPair(overrides: Partial<TokenPair> = {}): TokenPair {
  return { accessToken: 'access-1', refreshToken: 'refresh-1', ...overrides };
}

const TEST_HTTP_CONFIG = { baseUrl: 'http://api.test/api/v1', timeoutMs: 1000 } as const;

/**
 * Point the app-wide HTTP client at an in-memory adapter serving `routes`,
 * authenticated by a seeded token store. Requests to any other route 404.
 * Callers must tear it down with `resetAppHttpClientForTesting()`.
 */
export function installTestAppHttpClient(routes: readonly TestRoute[]): void {
  configureAppHttpClient(
    createHttpClient({
      config: TEST_HTTP_CONFIG,
      tokenStore: createMemoryTokenStore(buildTokenPair()),
      adapter: createTestAdapter(routes),
    }),
  );
}
