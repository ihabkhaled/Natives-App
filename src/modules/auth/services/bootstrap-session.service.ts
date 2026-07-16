import { useSessionStore } from '../store/session.store';
import { getAuthTokenRepository } from '../repositories/token.repository';

/**
 * Use case: derive the initial session status from securely stored tokens
 * at startup, without duplicating any remote state.
 */
export async function bootstrapSessionFromStoredTokens(): Promise<void> {
  const accessToken = await getAuthTokenRepository().getAccessToken();
  const state = useSessionStore.getState();
  if (accessToken === null || accessToken === '') {
    state.markAnonymous();
    return;
  }
  state.markAuthenticated();
}

/** Wired as the HTTP owner's unrecoverable-auth-failure callback. */
export function handleAuthFailure(): void {
  useSessionStore.getState().markAnonymous();
}
