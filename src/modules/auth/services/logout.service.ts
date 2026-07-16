import { trackEvent } from '@/packages/analytics';

import { AUTH_ANALYTICS_EVENTS } from '../constants/auth-analytics.constants';
import { requestLogout } from '../gateways/auth.gateway';
import { getAuthTokenRepository } from '../repositories/token.repository';

/**
 * Use case: end the session. The server call is best effort; local
 * tokens are always cleared even when the network is unavailable.
 */
export async function logoutUser(): Promise<void> {
  try {
    await requestLogout();
  } catch {
    // Best-effort server logout; local cleanup below is what matters.
  }
  await getAuthTokenRepository().clearTokens();
  trackEvent(AUTH_ANALYTICS_EVENTS.logoutCompleted);
}
