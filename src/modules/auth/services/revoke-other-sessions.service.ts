import { trackEvent } from '@/packages/analytics';
import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { AUTH_ANALYTICS_EVENTS } from '../constants/auth-analytics.constants';
import { requestSessionsRevokeOthers } from '../gateways/auth.gateway';

/** Use case: revoke every session except the current device; returns the count. */
export async function revokeOtherSessions(): Promise<number> {
  try {
    const response = await requestSessionsRevokeOthers();
    trackEvent(AUTH_ANALYTICS_EVENTS.sessionRevoked);
    return response.revokedCount;
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
