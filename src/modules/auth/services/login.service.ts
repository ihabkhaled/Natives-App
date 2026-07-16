import { trackEvent } from '@/packages/analytics';
import { HTTP_ERROR_KIND, isHttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { AUTH_ANALYTICS_EVENTS } from '../constants/auth-analytics.constants';
import { requestLogin } from '../gateways/auth.gateway';
import { mapLoginResponseToSession, type AuthSession } from '../mappers/auth.mapper';
import { getAuthTokenRepository } from '../repositories/token.repository';
import type { LoginCredentials } from '../types/auth.types';

function toLoginError(error: unknown): AppError {
  if (isHttpError(error)) {
    if (error.kind === HTTP_ERROR_KIND.Unauthorized) {
      return new AppError({ code: APP_ERROR_CODE.InvalidCredentials, cause: error });
    }
    return mapHttpErrorToAppError(error);
  }
  return toAppError(error);
}

/** Use case: authenticate, persist tokens securely, report the session. */
export async function loginUser(credentials: LoginCredentials): Promise<AuthSession> {
  try {
    const response = await requestLogin(credentials);
    const session = mapLoginResponseToSession(response);
    await getAuthTokenRepository().setTokens(session.tokens);
    trackEvent(AUTH_ANALYTICS_EVENTS.loginSucceeded);
    return session;
  } catch (error) {
    throw toLoginError(error);
  }
}
