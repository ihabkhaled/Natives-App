import type { TokenPair, TokenStore } from '@/packages/http';
import { getSecureValue, removeSecureValue, setSecureValue } from '@/packages/secure-storage';
import { STORAGE_KEYS } from '@/shared/config';

/**
 * Secure token persistence: hardware-backed storage on native, the
 * documented development fallback on web. Tokens never touch Preferences,
 * logs, or URLs (rules/18-security.md).
 */
export function createAuthTokenRepository(): TokenStore {
  return {
    getAccessToken: () => getSecureValue(STORAGE_KEYS.authAccessToken),
    getRefreshToken: () => getSecureValue(STORAGE_KEYS.authRefreshToken),
    setTokens: async (tokens: TokenPair) => {
      await setSecureValue(STORAGE_KEYS.authAccessToken, tokens.accessToken);
      await setSecureValue(STORAGE_KEYS.authRefreshToken, tokens.refreshToken);
    },
    clearTokens: async () => {
      await removeSecureValue(STORAGE_KEYS.authAccessToken);
      await removeSecureValue(STORAGE_KEYS.authRefreshToken);
    },
  };
}

let sharedRepository: TokenStore | null = null;

export function getAuthTokenRepository(): TokenStore {
  sharedRepository ??= createAuthTokenRepository();
  return sharedRepository;
}
