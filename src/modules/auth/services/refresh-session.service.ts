import type { RefreshExecutor } from '@/packages/http';

import { requestTokenRefresh } from '../gateways/auth.gateway';

/**
 * Use case: exchange a refresh token for a new pair. Wired into the HTTP
 * owner's single-flight coordinator at app startup.
 */
export function createRefreshExecutor(): RefreshExecutor {
  return async (refreshToken: string) => {
    const response = await requestTokenRefresh(refreshToken);
    return {
      accessToken: response.tokens.accessToken,
      refreshToken: response.tokens.refreshToken,
    };
  };
}
