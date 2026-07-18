import { afterEach, describe, expect, it } from 'vitest';

import { resetAppHttpClientForTesting, type TestRoute } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';

import { catchAppError } from '../../../../tests/setup/expect-app-error.helper';
import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';
import { AUTH_API_PATHS } from '../constants/auth-api.constants';
import { listSessions } from './list-sessions.service';

function sessionsRoute(status: number, data: unknown): TestRoute {
  return { method: 'GET', url: AUTH_API_PATHS.sessions, respond: () => ({ status, data }) };
}

const PAYLOAD = {
  sessions: [
    {
      id: 'tablet',
      device: 'Safari on iPad',
      approxLocation: 'Alexandria, EG',
      lastActiveAt: '2026-07-17T18:05:00.000Z',
      current: false,
    },
    {
      id: 'current',
      device: 'Chrome on macOS',
      approxLocation: 'Cairo, EG',
      lastActiveAt: '2026-07-18T09:30:00.000Z',
      current: true,
    },
  ],
  total: 2,
  limit: 20,
  offset: 0,
};

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('listSessions', () => {
  it('returns device sessions with the current device ordered first', async () => {
    installTestAppHttpClient([sessionsRoute(200, PAYLOAD)]);

    const sessions = await listSessions();

    expect(sessions.map((session) => session.id)).toEqual(['current', 'tablet']);
    expect(sessions[0]?.isCurrent).toBe(true);
  });

  it('maps an unauthorized response to a sanitized AppError', async () => {
    installTestAppHttpClient([sessionsRoute(401, { statusCode: 401 })]);

    const failure = await catchAppError(listSessions());

    expect(failure.code).toBe(APP_ERROR_CODE.Unauthorized);
  });

  it('wraps a non-transport failure as unexpected', async () => {
    const failure = await catchAppError(listSessions());

    expect(failure.code).toBe(APP_ERROR_CODE.Unexpected);
  });
});
