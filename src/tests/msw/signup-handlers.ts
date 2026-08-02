import { http, HttpResponse } from 'msw';

import { apiUrl, failRequest, readJsonBody } from './mock-request.helper';
import { nestErrorResponse } from './nest-error.helper';
import { PERSONA_USERS } from './personas.fixture';

const SIGNUP_PATH = '/auth/signup';
const MAX_DISPLAY_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 320;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 72;

/** Emails that requested an account during this mock lifetime. */
const requestedEmails = new Set<string>();

export function resetMockSignupState(): void {
  requestedEmails.clear();
}

interface SignupBody {
  readonly email?: string;
  readonly displayName?: string;
  readonly password?: string;
}

function isValidIdentity(email: string, displayName: string): boolean {
  return (
    email.includes('@') &&
    email.length <= MAX_EMAIL_LENGTH &&
    displayName.length > 0 &&
    displayName.length <= MAX_DISPLAY_NAME_LENGTH
  );
}

/** Mirrors the client signup schema, which mirrors the backend DTO. */
function isValidBody(body: SignupBody): boolean {
  const password = body.password ?? '';
  return (
    isValidIdentity(body.email ?? '', body.displayName ?? '') &&
    password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH
  );
}

function isTaken(email: string): boolean {
  return PERSONA_USERS[email] !== undefined || requestedEmails.has(email);
}

/**
 * Self-signup handler (contract 1.7.0). It answers `201 { message, state }`
 * with no tokens whatsoever — the account exists but stays inert until an
 * administrator approves it — and 409 for an address that already belongs to
 * an account or to an earlier, still-pending request.
 */
export const signupHandlers = [
  http.post(apiUrl(SIGNUP_PATH), async ({ request }) => {
    const body = await readJsonBody<SignupBody>(request);
    if (!isValidBody(body)) {
      return failRequest(400, 'VALIDATION_ERROR', SIGNUP_PATH);
    }
    const email = body.email ?? '';
    if (isTaken(email)) {
      return nestErrorResponse({
        statusCode: 409,
        code: 'EMAIL_ALREADY_REGISTERED',
        message: 'An account already exists for that email',
        path: `/api/v1${SIGNUP_PATH}`,
      });
    }
    requestedEmails.add(email);
    return HttpResponse.json(
      { message: 'identity.signup.received', state: 'pending' },
      { status: 201 },
    );
  }),
];
