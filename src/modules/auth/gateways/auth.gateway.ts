import { getAppHttpClient } from '@/packages/http';
import type {
  LoginRequestContract,
  LogoutRequestContract,
  RefreshRequestContract,
} from '@/packages/api-contract';
import type { SchemaOutput } from '@/packages/schema';

import {
  AUTH_API_PATHS,
  invitationDetailPath,
  sessionRevokePath,
} from '../constants/auth-api.constants';
import {
  authAckSchema,
  authUserDtoSchema,
  invitationDetailsDtoSchema,
  loginResponseSchema,
  logoutResponseSchema,
  refreshResponseSchema,
  revokeOthersResponseSchema,
  sessionListResponseSchema,
} from '../schemas/auth.schema';
import type { LoginCredentials } from '../types/auth.types';

/**
 * Auth resource gateway. The same wire contract serves remote NestJS mode
 * and deterministic MSW mock mode; nothing here knows which is active.
 */
export function requestLogin(
  credentials: LoginCredentials,
): Promise<SchemaOutput<typeof loginResponseSchema>> {
  const request: LoginRequestContract = credentials;
  return getAppHttpClient().post(AUTH_API_PATHS.login, request, loginResponseSchema, {
    skipAuth: true,
    skipRetryOnUnauthorized: true,
  });
}

export function requestTokenRefresh(
  refreshToken: string,
): Promise<SchemaOutput<typeof refreshResponseSchema>> {
  const request: RefreshRequestContract = { refreshToken };
  return getAppHttpClient().post(AUTH_API_PATHS.refresh, request, refreshResponseSchema, {
    skipAuth: true,
    skipRetryOnUnauthorized: true,
  });
}

export function requestLogout(
  refreshToken: string,
): Promise<SchemaOutput<typeof logoutResponseSchema>> {
  const request: LogoutRequestContract = { refreshToken };
  return getAppHttpClient().post(AUTH_API_PATHS.logout, request, logoutResponseSchema, {
    skipRetryOnUnauthorized: true,
  });
}

export function requestCurrentUser(): Promise<SchemaOutput<typeof authUserDtoSchema>> {
  return getAppHttpClient().get(AUTH_API_PATHS.currentUser, authUserDtoSchema);
}

/** Enumeration-safe: the response is identical whether the account exists. */
export function requestPasswordForgot(email: string): Promise<SchemaOutput<typeof authAckSchema>> {
  return getAppHttpClient().post(AUTH_API_PATHS.passwordForgot, { email }, authAckSchema, {
    skipAuth: true,
  });
}

export function requestPasswordReset(
  token: string,
  password: string,
): Promise<SchemaOutput<typeof authAckSchema>> {
  return getAppHttpClient().post(AUTH_API_PATHS.passwordReset, { token, password }, authAckSchema, {
    skipAuth: true,
  });
}

export function requestInvitationDetails(
  token: string,
): Promise<SchemaOutput<typeof invitationDetailsDtoSchema>> {
  return getAppHttpClient().get(invitationDetailPath(token), invitationDetailsDtoSchema, {
    skipAuth: true,
  });
}

export function requestInvitationAccept(
  token: string,
  password: string,
): Promise<SchemaOutput<typeof refreshResponseSchema>> {
  return getAppHttpClient().post(
    AUTH_API_PATHS.invitationAccept,
    { token, password },
    refreshResponseSchema,
    {
      skipAuth: true,
      skipRetryOnUnauthorized: true,
    },
  );
}

export function requestSessionList(): Promise<SchemaOutput<typeof sessionListResponseSchema>> {
  return getAppHttpClient().get(AUTH_API_PATHS.sessions, sessionListResponseSchema);
}

export function requestSessionRevoke(
  sessionId: string,
): Promise<SchemaOutput<typeof authAckSchema>> {
  return getAppHttpClient().post(sessionRevokePath(sessionId), {}, authAckSchema);
}

export function requestSessionsRevokeOthers(): Promise<
  SchemaOutput<typeof revokeOthersResponseSchema>
> {
  return getAppHttpClient().post(
    AUTH_API_PATHS.sessionsRevokeOthers,
    {},
    revokeOthersResponseSchema,
  );
}
