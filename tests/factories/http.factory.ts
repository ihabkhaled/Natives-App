import type { TokenPair, TokenStore } from '@/packages/http';

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
