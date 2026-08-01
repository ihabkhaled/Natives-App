import type { SessionView } from '@/modules/auth';

/**
 * The public navbar and footer show once the session status is resolved and
 * the visitor is anonymous — never during the brief "unknown" window (avoids
 * a flash before the authenticated app bar takes over) and never once a
 * session is confirmed.
 */
export function resolvePublicShellVisibility(session: SessionView): boolean {
  return session.isResolved && !session.isAuthenticated;
}
