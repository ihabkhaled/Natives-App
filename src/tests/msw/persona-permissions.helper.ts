import type { AuthUser } from '@/modules/auth';

import { MOCK_PERSONA_EMAILS, MOCK_TOKENS } from './mock-data.constants';
import { ADMIN_PERSONA, PERSONA_USERS } from './personas.fixture';

const PERSONA_TOKEN_PREFIX = 'mock-access-';
const PERSONA_BY_ID = new Map(Object.values(PERSONA_USERS).map((persona) => [persona.id, persona]));

const issuedTokenEmails = new Map<string, string>();

/** Remember which persona a freshly-issued token belongs to. */
export function rememberIssuedToken(token: string, email: string): void {
  issuedTokenEmails.set(token, email);
}

export function forgetIssuedTokens(): void {
  issuedTokenEmails.clear();
}

/** Cold-start resolution: derive the persona from the deterministic token shape. */
function personaForDeterministicToken(token: string): AuthUser | null {
  if (token === MOCK_TOKENS.access || token === MOCK_TOKENS.rotatedAccess) {
    return PERSONA_USERS[MOCK_PERSONA_EMAILS.admin] ?? null;
  }
  if (token.startsWith(PERSONA_TOKEN_PREFIX)) {
    return PERSONA_BY_ID.get(token.slice(PERSONA_TOKEN_PREFIX.length)) ?? null;
  }
  return null;
}

/**
 * Resolve the persona for a bearer token. Deterministic so a cold-start deep
 * link (which reloads the app and clears the issued-token map) still resolves
 * the stored token to its persona instead of a spurious 401.
 */
export function personaFromToken(request: Request): AuthUser | null {
  const token = (request.headers.get('Authorization') ?? '').replace('Bearer ', '');
  if (token === '') {
    return null;
  }
  const issuedEmail = issuedTokenEmails.get(token);
  if (issuedEmail !== undefined) {
    return PERSONA_USERS[issuedEmail] ?? null;
  }
  return personaForDeterministicToken(token);
}

/**
 * The caller's effective grants. Handlers use this to shape restricted
 * payloads exactly the way the real API will: the field is omitted, not
 * merely hidden by the client.
 */
export function permissionsForRequest(request: Request): readonly string[] {
  return personaFromToken(request)?.permissions ?? [];
}

/** The deterministic token pair a persona receives on login. */
export function tokensForPersona(user: AuthUser): { accessToken: string; refreshToken: string } {
  if (user.email === MOCK_PERSONA_EMAILS.admin) {
    return { accessToken: MOCK_TOKENS.access, refreshToken: MOCK_TOKENS.refresh };
  }
  return {
    accessToken: `${PERSONA_TOKEN_PREFIX}${user.id}`,
    refreshToken: `mock-refresh-${user.id}`,
  };
}

export { ADMIN_PERSONA };
