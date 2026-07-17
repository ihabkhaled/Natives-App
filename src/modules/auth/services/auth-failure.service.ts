import { useSessionStore } from '../store/session.store';

/**
 * Use case: react to an unrecoverable authentication failure. Wired as the
 * HTTP owner's auth-failure callback; tokens are already cleared by the
 * refresh coordinator when this fires.
 */
export function handleAuthFailure(): void {
  useSessionStore.getState().markAnonymous();
}
