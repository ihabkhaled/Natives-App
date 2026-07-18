import type { RefreshExecutor } from '@/packages/http';

import { requestTokenRefresh } from '../gateways/auth.gateway';
import { mapAuthSessionResponseToTokens } from '../mappers/auth.mapper';

/**
 * Use case: exchange a refresh token for a new pair. Wired into the HTTP
 * owner's single-flight coordinator at app startup.
 */
export function createRefreshExecutor(): RefreshExecutor {
  return async (refreshToken: string) => {
    const response = await requestTokenRefresh(refreshToken);
    return mapAuthSessionResponseToTokens(response);
  };
}
