import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  configureAppHttpClient,
  createHttpClient,
  createTestAdapter,
  resetAppHttpClientForTesting,
  type TestRoute,
} from '@/packages/http';

import { buildTokenPair, createMemoryTokenStore } from '../../../../tests/factories/http.factory';
import {
  AUTH_API_PATHS,
  invitationAcceptPath,
  invitationDetailPath,
  sessionRevokePath,
} from '../constants/auth-api.constants';
import {
  requestCurrentUser,
  requestInvitationAccept,
  requestInvitationDetails,
  requestLogin,
  requestLogout,
  requestPasswordForgot,
  requestPasswordReset,
  requestSessionList,
  requestSessionRevoke,
  requestSessionsRevokeOthers,
  requestTokenRefresh,
} from './auth.gateway';

interface SeenRequest {
  readonly url: string;
  readonly data: unknown;
  readonly headers: Record<string, unknown>;
}

const USER_DTO = {
  id: 'user-1',
  email: 'ranger@example.com',
  displayName: 'Ranger One',
  permissions: ['members.read'],
  accountState: 'active',
  onboardingComplete: true,
  memberships: [
    { teamId: 'team-1', teamName: 'Team One', seasonId: 'season-1', seasonName: 'Season One' },
  ],
};
const TOKENS_DTO = { accessToken: 'access-2', refreshToken: 'refresh-2' };
const INVITATION_DTO = {
  email: 'invitee@example.com',
  teamName: 'Cairo Natives',
  inviterName: 'Coach Nadia',
  expiresAt: '2026-08-01T12:00:00.000Z',
};
const SESSION_DTO = {
  id: 'session-2',
  device: 'Safari on iPad',
  approxLocation: 'Cairo, EG',
  lastActiveAt: '2026-07-18T09:30:00.000Z',
  current: false,
};
const INVITE_TOKEN = 'invite-1';

let seen: SeenRequest[] = [];

function recordingRoute(method: string, url: string, data: unknown): TestRoute {
  return {
    method,
    url,
    respond: (config) => {
      seen.push({ url, data: config.data, headers: config.headers });
      return { status: 200, data };
    },
  };
}

function seenFor(url: string): SeenRequest {
  const request = seen.find((candidate) => candidate.url === url);
  expect(request).toBeDefined();
  return request!;
}

beforeEach(() => {
  seen = [];
  configureAppHttpClient(
    createHttpClient({
      config: { baseUrl: 'http://api.test/api/v1', timeoutMs: 1000 },
      tokenStore: createMemoryTokenStore(buildTokenPair()),
      adapter: createTestAdapter([
        recordingRoute('POST', AUTH_API_PATHS.login, { tokens: TOKENS_DTO, user: USER_DTO }),
        recordingRoute('POST', AUTH_API_PATHS.refresh, { tokens: TOKENS_DTO }),
        recordingRoute('POST', AUTH_API_PATHS.logout, { success: true }),
        recordingRoute('GET', AUTH_API_PATHS.currentUser, USER_DTO),
        recordingRoute('POST', AUTH_API_PATHS.passwordForgot, { success: true }),
        recordingRoute('POST', AUTH_API_PATHS.passwordReset, { success: true }),
        recordingRoute('GET', invitationDetailPath(INVITE_TOKEN), INVITATION_DTO),
        recordingRoute('POST', invitationAcceptPath(INVITE_TOKEN), {
          tokens: TOKENS_DTO,
          user: USER_DTO,
        }),
        recordingRoute('GET', AUTH_API_PATHS.sessions, { sessions: [SESSION_DTO] }),
        recordingRoute('POST', sessionRevokePath('session-2'), { success: true }),
        recordingRoute('POST', AUTH_API_PATHS.sessionsRevokeOthers, { revokedCount: 2 }),
      ]),
    }),
  );
});

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('requestLogin', () => {
  it('posts the credentials to the login endpoint and returns the parsed envelope', async () => {
    const response = await requestLogin({ email: 'ranger@example.com', password: 'Sup3rSecret!' });

    expect(response).toEqual({ tokens: TOKENS_DTO, user: USER_DTO });
    expect(seenFor(AUTH_API_PATHS.login).data).toEqual({
      email: 'ranger@example.com',
      password: 'Sup3rSecret!',
    });
  });

  it('never attaches a bearer token to the login request', async () => {
    await requestLogin({ email: 'ranger@example.com', password: 'Sup3rSecret!' });

    expect(seenFor(AUTH_API_PATHS.login).headers['Authorization']).toBeUndefined();
  });

  it('carries a correlation id like every other request', async () => {
    await requestLogin({ email: 'ranger@example.com', password: 'Sup3rSecret!' });

    expect(String(seenFor(AUTH_API_PATHS.login).headers['X-Request-Id'])).not.toBe('');
  });
});

describe('requestTokenRefresh', () => {
  it('posts the refresh token and returns the rotated pair', async () => {
    const response = await requestTokenRefresh('refresh-1');

    expect(response).toEqual({ tokens: TOKENS_DTO });
    expect(seenFor(AUTH_API_PATHS.refresh).data).toEqual({ refreshToken: 'refresh-1' });
  });

  it('never attaches a bearer token to the refresh request', async () => {
    await requestTokenRefresh('refresh-1');

    expect(seenFor(AUTH_API_PATHS.refresh).headers['Authorization']).toBeUndefined();
  });
});

describe('requestLogout', () => {
  it('posts an empty body to the logout endpoint with the bearer token', async () => {
    const response = await requestLogout();

    expect(response).toEqual({ success: true });
    expect(seenFor(AUTH_API_PATHS.logout).data).toEqual({});
    expect(seenFor(AUTH_API_PATHS.logout).headers['Authorization']).toBe('Bearer access-1');
  });
});

describe('requestCurrentUser', () => {
  it('gets the profile with the bearer token and returns the parsed user', async () => {
    const response = await requestCurrentUser();

    expect(response).toEqual(USER_DTO);
    expect(seenFor(AUTH_API_PATHS.currentUser).headers['Authorization']).toBe('Bearer access-1');
  });

  it('rejects a profile payload that violates the wire contract', async () => {
    resetAppHttpClientForTesting();
    configureAppHttpClient(
      createHttpClient({
        config: { baseUrl: 'http://api.test/api/v1', timeoutMs: 1000 },
        tokenStore: createMemoryTokenStore(buildTokenPair()),
        adapter: createTestAdapter([
          recordingRoute('GET', AUTH_API_PATHS.currentUser, { ...USER_DTO, email: 'nope' }),
        ]),
      }),
    );

    await expect(requestCurrentUser()).rejects.toThrow();
  });
});

describe('requestPasswordForgot', () => {
  it('posts the email without a bearer token and returns the acknowledgement', async () => {
    const response = await requestPasswordForgot('user@example.com');

    expect(response).toEqual({ success: true });
    const request = seenFor(AUTH_API_PATHS.passwordForgot);
    expect(request.data).toEqual({ email: 'user@example.com' });
    expect(request.headers['Authorization']).toBeUndefined();
  });
});

describe('requestPasswordReset', () => {
  it('posts the token and new password without a bearer token', async () => {
    const response = await requestPasswordReset('reset-token', 'Ranger#Strong1234');

    expect(response).toEqual({ success: true });
    const request = seenFor(AUTH_API_PATHS.passwordReset);
    expect(request.data).toEqual({ token: 'reset-token', password: 'Ranger#Strong1234' });
    expect(request.headers['Authorization']).toBeUndefined();
  });
});

describe('requestInvitationDetails', () => {
  it('reads the invitation without a bearer token and returns the parsed details', async () => {
    const response = await requestInvitationDetails(INVITE_TOKEN);

    expect(response).toEqual(INVITATION_DTO);
    expect(seenFor(invitationDetailPath(INVITE_TOKEN)).headers['Authorization']).toBeUndefined();
  });
});

describe('requestInvitationAccept', () => {
  it('posts the chosen password and returns the login envelope', async () => {
    const response = await requestInvitationAccept(INVITE_TOKEN, 'Ranger#Strong1234');

    expect(response).toEqual({ tokens: TOKENS_DTO, user: USER_DTO });
    const request = seenFor(invitationAcceptPath(INVITE_TOKEN));
    expect(request.data).toEqual({ password: 'Ranger#Strong1234' });
    expect(request.headers['Authorization']).toBeUndefined();
  });
});

describe('session gateways', () => {
  it('lists sessions with the bearer token', async () => {
    const response = await requestSessionList();

    expect(response).toEqual({ sessions: [SESSION_DTO] });
    expect(seenFor(AUTH_API_PATHS.sessions).headers['Authorization']).toBe('Bearer access-1');
  });

  it('revokes a single session with the bearer token', async () => {
    const response = await requestSessionRevoke('session-2');

    expect(response).toEqual({ success: true });
    expect(seenFor(sessionRevokePath('session-2')).headers['Authorization']).toBe(
      'Bearer access-1',
    );
  });

  it('revokes other sessions and returns the revoked count', async () => {
    const response = await requestSessionsRevokeOthers();

    expect(response).toEqual({ revokedCount: 2 });
    expect(seenFor(AUTH_API_PATHS.sessionsRevokeOthers).headers['Authorization']).toBe(
      'Bearer access-1',
    );
  });
});
