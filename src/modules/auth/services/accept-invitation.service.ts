import { trackEvent } from '@/packages/analytics';

import { AUTH_ANALYTICS_EVENTS } from '../constants/auth-analytics.constants';
import { requestInvitationAccept } from '../gateways/auth.gateway';
import { mapLoginResponseToSession, type AuthSession } from '../mappers/auth.mapper';
import { getAuthTokenRepository } from '../repositories/token.repository';
import { mapAuthLinkError } from './map-auth-link-error.helper';

/**
 * Use case: accept an invitation by creating a password. On success the backend
 * returns a full session; tokens are persisted securely and the caller flips
 * the session to authenticated.
 */
export async function acceptInvitation(token: string, password: string): Promise<AuthSession> {
  try {
    const response = await requestInvitationAccept(token, password);
    const session = mapLoginResponseToSession(response);
    await getAuthTokenRepository().setTokens(session.tokens);
    trackEvent(AUTH_ANALYTICS_EVENTS.invitationAccepted);
    return session;
  } catch (error) {
    throw mapAuthLinkError(error);
  }
}
