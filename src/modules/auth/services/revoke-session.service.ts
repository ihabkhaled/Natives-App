import { trackEvent } from '@/packages/analytics';
import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { AUTH_ANALYTICS_EVENTS } from '../constants/auth-analytics.constants';
import { requestSessionRevoke } from '../gateways/auth.gateway';

/** Use case: revoke one other device session by id. */
export async function revokeSession(sessionId: string): Promise<void> {
  try {
    await requestSessionRevoke(sessionId);
    trackEvent(AUTH_ANALYTICS_EVENTS.sessionRevoked);
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
