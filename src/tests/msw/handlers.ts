import { delay, http, HttpResponse } from 'msw';

import type { AuthUser } from '@/modules/auth';
import { getEnvironment } from '@/packages/environment';

import { adminHandlers } from './admin-handlers';
import { resetMockAdminState } from './admin-rules.fixture';
import { resetMockOperationsState } from './admin-operations.fixture';
import { assessmentsHandlers } from './assessments-handlers';
import { resetMockAssessmentsState } from './assessments.fixture';
import { competitionsHandlers } from './competitions-handlers';
import { buildDashboardSummaryResponse } from './dashboard-summary.fixture';
import { attendanceHandlers } from './attendance-handlers';
import { resetMockAttendanceState } from './attendance.fixture';
import {
  MOCK_CREDENTIALS,
  MOCK_HEALTH,
  MOCK_PERSONA_EMAILS,
  MOCK_SCENARIO_EMAILS,
  MOCK_TIMEOUT_DELAY_MS,
  MOCK_TOKENS,
} from './mock-data.constants';
import { matchesHandlers } from './matches-handlers';
import { resetMockMatchesState } from './matches.fixture';
import { membersHandlers } from './members-handlers';
import { resetMockMembersState } from './members.fixture';
import { nestErrorResponse } from './nest-error.helper';
import {
  ADMIN_PERSONA,
  forgetIssuedTokens,
  personaFromToken,
  rememberIssuedToken,
  tokensForPersona,
} from './persona-permissions.helper';
import { PERSONA_USERS } from './personas.fixture';
import { resetMockPlatformAdminsState } from './platform-admins.fixture';
import { pointsHandlers } from './points-handlers';
import { practiceHandlers } from './practice-handlers';
import { resetMockPracticeState } from './practice.fixture';
import { recoveryHandlers, resetMockRecoveryState } from './recovery-handlers';
import { rostersHandlers } from './rosters-handlers';
import { resetMockRostersState } from './rosters.fixture';
import { resetMockSquadsState } from './squads.fixture';
import { notificationsHandlers } from './notifications-handlers';
import { resetMockNotificationsState } from './notifications.fixture';
import { tryoutsHandlers } from './tryouts-handlers';
import { resetMockTryoutsState } from './tryouts.fixture';
import { teamsHandlers } from './teams-handlers';
import { trainingHandlers } from './training-handlers';
import { resetMockTrainingState } from './training.fixture';

export function resetMockAuthState(): void {
  forgetIssuedTokens();
  resetMockRecoveryState();
  resetMockPracticeState();
  resetMockAttendanceState();
  resetMockMembersState();
  resetMockAssessmentsState();
  resetMockTrainingState();
  resetMockSquadsState();
  resetMockRostersState();
  resetMockTryoutsState();
  resetMockNotificationsState();
  resetMockAdminState();
  resetMockOperationsState();
  resetMockPlatformAdminsState();
  resetMockMatchesState();
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

function issueTokensForUser(user: AuthUser): { accessToken: string; refreshToken: string } {
  const tokens = tokensForPersona(user);
  rememberIssuedToken(tokens.accessToken, user.email);
  return tokens;
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
    const persona = PERSONA_USERS[body.email];
    if (persona === undefined || body.password !== MOCK_CREDENTIALS.password) {
      return nestErrorResponse({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
        path: '/api/v1/auth/login',
      });
    }
    resetMockRecoveryState();
    return HttpResponse.json({ tokens: issueTokensForUser(persona), user: persona });
  }),
  http.post(apiUrl('/auth/refresh'), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { refreshToken?: string };
    if (
      body.refreshToken !== MOCK_TOKENS.refresh &&
      body.refreshToken !== MOCK_TOKENS.rotatedRefresh
    ) {
      return nestErrorResponse({
        statusCode: 401,
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token is invalid',
        path: '/api/v1/auth/refresh',
      });
    }
    rememberIssuedToken(MOCK_TOKENS.rotatedAccess, MOCK_PERSONA_EMAILS.admin);
    return HttpResponse.json({
      accessToken: MOCK_TOKENS.rotatedAccess,
      refreshToken: MOCK_TOKENS.rotatedRefresh,
      refreshTokenExpiresAt: MOCK_TOKENS.rotatedRefreshExpiresAt,
      userId: ADMIN_PERSONA.id,
    });
  }),
  http.post(apiUrl('/auth/logout'), () =>
    HttpResponse.json({ message: 'identity.session.revoked' }),
  ),
  http.get(apiUrl('/auth/me'), ({ request }) => {
    const persona = personaFromToken(request);
    if (persona === null) {
      return nestErrorResponse({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid access token',
        path: '/api/v1/auth/me',
      });
    }
    return HttpResponse.json(persona);
  }),
  http.get(apiUrl('/dashboard/summary'), ({ request }) => {
    const persona = personaFromToken(request);
    if (persona === null) {
      return nestErrorResponse({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid access token',
        path: '/api/v1/dashboard/summary',
      });
    }
    return HttpResponse.json(buildDashboardSummaryResponse(persona));
  }),
  ...practiceHandlers,
  ...attendanceHandlers,
  ...membersHandlers,
  ...assessmentsHandlers,
  ...trainingHandlers,
  ...competitionsHandlers,
  ...rostersHandlers,
  ...matchesHandlers,
  ...tryoutsHandlers,
  ...notificationsHandlers,
  ...adminHandlers,
  ...pointsHandlers,
  ...teamsHandlers,
  ...recoveryHandlers,
];
