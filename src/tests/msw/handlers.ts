import { delay, http, HttpResponse } from 'msw';

import { buildAuthUser } from '@/modules/auth';
import { getEnvironment } from '@/packages/environment';

import {
  MOCK_CREDENTIALS,
  MOCK_HEALTH,
  MOCK_SCENARIO_EMAILS,
  MOCK_TIMEOUT_DELAY_MS,
  MOCK_TOKENS,
} from './mock-data.constants';
import { nestErrorResponse } from './nest-error.helper';

const issuedAccessTokens = new Set<string>();

export function resetMockAuthState(): void {
  issuedAccessTokens.clear();
}

function apiUrl(path: string): string {
  return `${getEnvironment().apiBaseUrl}${path}`;
}

interface LoginBody {
  readonly email?: string;
  readonly password?: string;
}

async function readLoginBody(request: Request): Promise<LoginBody> {
  try {
    return (await request.json()) as LoginBody;
  } catch {
    return {};
  }
}

function scenarioResponseForEmail(email: string): Response | Promise<Response> | null {
  if (email === MOCK_SCENARIO_EMAILS.forbidden) {
    return nestErrorResponse({
      statusCode: 403,
      code: 'ACCOUNT_LOCKED',
      message: 'Account is locked',
      path: '/api/v1/auth/login',
    });
  }
  if (email === MOCK_SCENARIO_EMAILS.rateLimited) {
    return nestErrorResponse({
      statusCode: 429,
      code: 'RATE_LIMITED',
      message: 'Too many attempts',
      path: '/api/v1/auth/login',
    });
  }
  if (email === MOCK_SCENARIO_EMAILS.serverError) {
    return nestErrorResponse({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: 'Unexpected server failure',
      path: '/api/v1/auth/login',
    });
  }
  if (email === MOCK_SCENARIO_EMAILS.timeout) {
    return delay(MOCK_TIMEOUT_DELAY_MS).then(() =>
      nestErrorResponse({
        statusCode: 504,
        code: 'TIMEOUT',
        message: 'Upstream timeout',
        path: '/api/v1/auth/login',
      }),
    );
  }
  return null;
}

function issueTokens(access: string, refresh: string): { accessToken: string; refreshToken: string } {
  issuedAccessTokens.add(access);
  return { accessToken: access, refreshToken: refresh };
}

function isAuthorized(request: Request): boolean {
  const header = request.headers.get('Authorization') ?? '';
  const token = header.replace('Bearer ', '');
  return issuedAccessTokens.has(token);
}

/**
 * Deterministic NestJS-compatible handlers. The wire contract is identical
 * to remote mode: the same Zod schemas parse both.
 */
export const mockApiHandlers = [
  http.get(apiUrl('/health'), () =>
    HttpResponse.json({
      status: 'ok',
      version: MOCK_HEALTH.version,
      timestamp: MOCK_HEALTH.timestamp,
    }),
  ),
  http.post(apiUrl('/auth/login'), async ({ request }) => {
    const body = await readLoginBody(request);
    if (body.email === undefined || body.password === undefined) {
      return nestErrorResponse({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        path: '/api/v1/auth/login',
        errors: [{ field: 'email', code: 'REQUIRED', message: 'email is required' }],
      });
    }
    const scenario = scenarioResponseForEmail(body.email);
    if (scenario !== null) {
      return scenario;
    }
    if (body.email !== MOCK_CREDENTIALS.email || body.password !== MOCK_CREDENTIALS.password) {
      return nestErrorResponse({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
        path: '/api/v1/auth/login',
      });
    }
    return HttpResponse.json({
      tokens: issueTokens(MOCK_TOKENS.access, MOCK_TOKENS.refresh),
      user: buildAuthUser(),
    });
  }),
  http.post(apiUrl('/auth/refresh'), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { refreshToken?: string };
    if (body.refreshToken !== MOCK_TOKENS.refresh && body.refreshToken !== MOCK_TOKENS.rotatedRefresh) {
      return nestErrorResponse({
        statusCode: 401,
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token is invalid',
        path: '/api/v1/auth/refresh',
      });
    }
    return HttpResponse.json({
      tokens: issueTokens(MOCK_TOKENS.rotatedAccess, MOCK_TOKENS.rotatedRefresh),
    });
  }),
  http.post(apiUrl('/auth/logout'), () => HttpResponse.json({ success: true })),
  http.get(apiUrl('/auth/me'), ({ request }) => {
    if (!isAuthorized(request)) {
      return nestErrorResponse({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid access token',
        path: '/api/v1/auth/me',
      });
    }
    return HttpResponse.json(buildAuthUser());
  }),
];
