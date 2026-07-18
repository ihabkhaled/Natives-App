import { http, HttpResponse } from 'msw';

import { buildAuthUser } from '@/modules/auth';
import { getEnvironment } from '@/packages/environment';

import { MOCK_INVITATION, MOCK_RESET, MOCK_SESSIONS, MOCK_TOKENS } from './mock-data.constants';
import { nestErrorResponse } from './nest-error.helper';

const API_PREFIX = '/api/v1';

/** Sessions revoked within the current mock lifetime; reset on login/tests. */
const revokedSessionIds = new Set<string>();

export function resetMockRecoveryState(): void {
  revokedSessionIds.clear();
}

function apiUrl(path: string): string {
  return `${getEnvironment().apiBaseUrl}${path}`;
}

async function readJsonBody<T>(request: Request): Promise<T> {
  return (await request.json().catch(() => ({}))) as T;
}

/** Bearer presence is enough for the mock; the real API verifies the JWT. */
function isAuthorized(request: Request): boolean {
  const header = request.headers.get('Authorization') ?? '';
  return header.startsWith('Bearer ') && header.length > 'Bearer '.length;
}

function unauthorized(path: string): Response {
  return nestErrorResponse({
    statusCode: 401,
    code: 'UNAUTHORIZED',
    message: 'Missing or invalid access token',
    path: `${API_PREFIX}${path}`,
  });
}

function weakPasswordResponse(path: string): Response {
  return nestErrorResponse({
    statusCode: 422,
    code: 'VALIDATION_ERROR',
    message: 'Password does not meet the policy',
    path: `${API_PREFIX}${path}`,
    errors: [{ field: 'password', code: 'WEAK_PASSWORD', message: 'Password too weak' }],
  });
}

/** Mirrors the client set-password policy: 12+ chars, mixed case, a digit. */
function isStrongPassword(password: string): boolean {
  return (
    password.length >= 12 &&
    /[a-z]/u.test(password) &&
    /[A-Z]/u.test(password) &&
    /\d/u.test(password)
  );
}

function invitationError(token: string, path: string): Response | null {
  if (token === MOCK_INVITATION.expiredToken) {
    return nestErrorResponse({
      statusCode: 410,
      code: 'INVITATION_EXPIRED',
      message: 'Expired',
      path,
    });
  }
  if (token === MOCK_INVITATION.usedToken) {
    return nestErrorResponse({ statusCode: 409, code: 'INVITATION_USED', message: 'Used', path });
  }
  if (token !== MOCK_INVITATION.validToken) {
    return nestErrorResponse({
      statusCode: 404,
      code: 'INVITATION_NOT_FOUND',
      message: 'Missing',
      path,
    });
  }
  return null;
}

interface PasswordBody {
  readonly password?: string;
  readonly token?: string;
}

/** Recovery, invitation, and session-management handlers (NestJS-shaped). */
export const recoveryHandlers = [
  http.post(apiUrl('/auth/password/forgot'), () => HttpResponse.json({ success: true })),
  http.post(apiUrl('/auth/password/reset'), async ({ request }) => {
    const path = `${API_PREFIX}/auth/password/reset`;
    const body = await readJsonBody<PasswordBody>(request);
    if (body.token !== MOCK_RESET.validToken) {
      return nestErrorResponse({
        statusCode: 410,
        code: 'RESET_LINK_INVALID',
        message: 'Invalid',
        path,
      });
    }
    if (!isStrongPassword(body.password ?? '')) {
      return weakPasswordResponse('/auth/password/reset');
    }
    return HttpResponse.json({ success: true });
  }),
  http.get(apiUrl('/auth/invitations/:token'), ({ params }) => {
    const token = String(params['token']);
    const error = invitationError(token, `${API_PREFIX}/auth/invitations/${token}`);
    if (error !== null) {
      return error;
    }
    return HttpResponse.json({
      email: MOCK_INVITATION.email,
      teamName: MOCK_INVITATION.teamName,
      inviterName: MOCK_INVITATION.inviterName,
      expiresAt: MOCK_INVITATION.expiresAt,
    });
  }),
  http.post(apiUrl('/auth/invitations/:token/accept'), async ({ params, request }) => {
    const token = String(params['token']);
    const error = invitationError(token, `${API_PREFIX}/auth/invitations/${token}/accept`);
    if (error !== null) {
      return error;
    }
    const body = await readJsonBody<PasswordBody>(request);
    if (!isStrongPassword(body.password ?? '')) {
      return weakPasswordResponse('/auth/invitations/accept');
    }
    revokedSessionIds.clear();
    return HttpResponse.json({
      tokens: { accessToken: MOCK_TOKENS.access, refreshToken: MOCK_TOKENS.refresh },
      user: buildAuthUser({ email: MOCK_INVITATION.email, displayName: 'Invited Ranger' }),
    });
  }),
  http.get(apiUrl('/auth/sessions'), ({ request }) => {
    if (!isAuthorized(request)) {
      return unauthorized('/auth/sessions');
    }
    return HttpResponse.json({
      sessions: MOCK_SESSIONS.filter((session) => !revokedSessionIds.has(session.id)),
    });
  }),
  http.post(apiUrl('/auth/sessions/revoke-others'), ({ request }) => {
    if (!isAuthorized(request)) {
      return unauthorized('/auth/sessions/revoke-others');
    }
    const others = MOCK_SESSIONS.filter((session) => !session.current);
    for (const session of others) {
      revokedSessionIds.add(session.id);
    }
    return HttpResponse.json({ revokedCount: others.length });
  }),
  http.post(apiUrl('/auth/sessions/:id/revoke'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return unauthorized('/auth/sessions/revoke');
    }
    const id = String(params['id']);
    if (!MOCK_SESSIONS.some((session) => session.id === id)) {
      return nestErrorResponse({
        statusCode: 404,
        code: 'SESSION_NOT_FOUND',
        message: 'Not found',
        path: `${API_PREFIX}/auth/sessions/${id}/revoke`,
      });
    }
    revokedSessionIds.add(id);
    return HttpResponse.json({ success: true });
  }),
];
