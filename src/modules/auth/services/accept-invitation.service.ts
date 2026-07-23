import { trackEvent } from '@/packages/analytics';

import { AUTH_ANALYTICS_EVENTS } from '../constants/auth-analytics.constants';
import { requestInvitationAccept } from '../gateways/auth.gateway';
import { mapAuthSessionResponseToTokens, type AuthSession } from '../mappers/auth.mapper';
import { getAuthTokenRepository } from '../repositories/token.repository';
import { getCurrentUser } from './get-current-user.service';
import { mapAuthLinkError } from './map-auth-link-error.helper';

/**
 * Use case: accept an invitation, persist the flat backend session response,
 * then hydrate the real current user. A failed hydration clears the new tokens
 * so the app never enters a fabricated or partial authenticated state. The
 * optional display name travels with the accept call; an empty one lets the
 * backend keep its own default.
 */
export async function acceptInvitation(
  token: string,
  password: string,
  displayName: string,
): Promise<AuthSession> {
  try {
    const response = await requestInvitationAccept(token, password, displayName);
    const tokens = mapAuthSessionResponseToTokens(response);
    const tokenRepository = getAuthTokenRepository();
    await tokenRepository.setTokens(tokens);
    let user;
    try {
      user = await getCurrentUser();
    } catch (error) {
      await tokenRepository.clearTokens();
      throw error;
    }
    trackEvent(AUTH_ANALYTICS_EVENTS.invitationAccepted);
    return { tokens, user };
  } catch (error) {
    throw mapAuthLinkError(error);
  }
}
