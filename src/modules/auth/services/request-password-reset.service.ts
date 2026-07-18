import { trackEvent } from '@/packages/analytics';
import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { AUTH_ANALYTICS_EVENTS } from '../constants/auth-analytics.constants';
import { requestPasswordForgot } from '../gateways/auth.gateway';

/**
 * Use case: ask the backend to email a password-reset link. The response is
 * enumeration-safe (identical whether or not the account exists); the UI shows
 * one generic confirmation regardless.
 */
export async function requestPasswordResetLink(email: string): Promise<void> {
  try {
    await requestPasswordForgot(email);
    trackEvent(AUTH_ANALYTICS_EVENTS.passwordResetRequested);
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
