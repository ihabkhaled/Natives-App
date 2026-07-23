import { http, HttpResponse } from 'msw';

import { MOCK_INVITATION, MOCK_RESET, MOCK_SESSIONS, MOCK_TOKENS } from './mock-data.constants';
import { apiUrl, isAuthorized } from './mock-request.helper';
import { nestErrorResponse } from './nest-error.helper';

const API_PREFIX = '/api/v1';

/** Sessions revoked within the current mock lifetime; reset on login/tests. */
const revokedSessionIds = new Set<string>();

export function resetMockRecoveryState(): void {
  revokedSessionIds.clear();
}

async function readJsonBody<T>(request: Request): Promise<T> {
  return (await request.json().catch(() => ({}))) as T;
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
  if (token !== MOCK_INVITATION.validToken) {
    return nestErrorResponse({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'The invitation is no longer valid',
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
  http.post(apiUrl('/auth/forgot-password'), () =>
    HttpResponse.json({ message: 'identity.password.reset.requested' }),
  ),
  http.post(apiUrl('/auth/reset-password'), async ({ request }) => {
    const path = `${API_PREFIX}/auth/reset-password`;
    const body = await readJsonBody<PasswordBody>(request);
    if (body.token !== MOCK_RESET.validToken) {
      return nestErrorResponse({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'The reset token is invalid',
        path,
      });
    }
    if (!isStrongPassword(body.password ?? '')) {
      return weakPasswordResponse('/auth/reset-password');
    }
    return HttpResponse.json({ message: 'identity.password.reset.completed' });
  }),
  http.get(apiUrl('/auth/invitations/:token'), ({ params }) => {
    const token = String(params['token']);
    const error = invitationError(token, `${API_PREFIX}/auth/invitations/${token}`);
    if (error !== null) {
      return error;
    }
    return HttpResponse.json({
      email: MOCK_INVITATION.email,
      role: MOCK_INVITATION.role,
      inviterName: MOCK_INVITATION.inviterName,
      teamRole: MOCK_INVITATION.teamRole,
      teamId: MOCK_INVITATION.teamId,
      teamName: MOCK_INVITATION.teamName,
      expiresAt: MOCK_INVITATION.expiresAt,
    });
  }),
  http.post(apiUrl('/invitations/accept'), async ({ request }) => {
    const body = await readJsonBody<PasswordBody>(request);
    const token = body.token ?? '';
    const error = invitationError(token, `${API_PREFIX}/invitations/accept`);
    if (error !== null) {
      return error;
    }
    if (!isStrongPassword(body.password ?? '')) {
      return weakPasswordResponse('/invitations/accept');
    }
    revokedSessionIds.clear();
    return HttpResponse.json(
      {
        accessToken: MOCK_TOKENS.invitedAccess,
        refreshToken: MOCK_TOKENS.invitedRefresh,
        refreshTokenExpiresAt: MOCK_TOKENS.invitedRefreshExpiresAt,
        userId: 'user-invited',
      },
      { status: 201 },
    );
  }),
  http.get(apiUrl('/auth/sessions'), ({ request }) => {
    if (!isAuthorized(request)) {
      return unauthorized('/auth/sessions');
    }
    const sessions = MOCK_SESSIONS.filter((session) => !revokedSessionIds.has(session.id));
    return HttpResponse.json({ sessions, total: sessions.length, limit: 20, offset: 0 });
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
    return HttpResponse.json({ message: 'identity.session.revoked' });
  }),
];
