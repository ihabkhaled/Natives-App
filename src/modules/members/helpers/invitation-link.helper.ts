import { APP_PATHS } from '@/shared/config';

/**
 * The absolute, one-time accept link for an issued invitation.
 *
 * The backend returns only the opaque token; the route that consumes it is the
 * client's, so the client is what turns the token into a link. Built from the
 * origin this build is served from — never a hard-coded host — and the token is
 * URL-encoded because it is opaque server-issued text, not a known alphabet.
 */
export function buildInvitationAcceptUrl(origin: string, token: string): string {
  return `${origin}${APP_PATHS.acceptInvitation}?token=${encodeURIComponent(token)}`;
}
