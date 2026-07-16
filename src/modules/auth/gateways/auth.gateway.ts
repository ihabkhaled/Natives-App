import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import { AUTH_API_PATHS } from '../constants/auth-api.constants';
import {
  authUserDtoSchema,
  loginResponseSchema,
  logoutResponseSchema,
  refreshResponseSchema,
} from '../schemas/auth.schema';
import type { LoginCredentials } from '../types/auth.types';

/**
 * Auth resource gateway. The same wire contract serves remote NestJS mode
 * and deterministic MSW mock mode; nothing here knows which is active.
 */
export function requestLogin(
  credentials: LoginCredentials,
): Promise<SchemaOutput<typeof loginResponseSchema>> {
  return getAppHttpClient().post(AUTH_API_PATHS.login, credentials, loginResponseSchema, {
    skipAuth: true,
    skipRetryOnUnauthorized: true,
  });
}

export function requestTokenRefresh(
  refreshToken: string,
): Promise<SchemaOutput<typeof refreshResponseSchema>> {
  return getAppHttpClient().post(AUTH_API_PATHS.refresh, { refreshToken }, refreshResponseSchema, {
    skipAuth: true,
    skipRetryOnUnauthorized: true,
  });
}

export function requestLogout(): Promise<SchemaOutput<typeof logoutResponseSchema>> {
  return getAppHttpClient().post(AUTH_API_PATHS.logout, {}, logoutResponseSchema, {
    skipRetryOnUnauthorized: true,
  });
}

export function requestCurrentUser(): Promise<SchemaOutput<typeof authUserDtoSchema>> {
  return getAppHttpClient().get(AUTH_API_PATHS.currentUser, authUserDtoSchema);
}
