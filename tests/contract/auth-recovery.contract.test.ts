import { assert, describe, expect, it } from 'vitest';

import {
  authAckSchema,
  authUserDtoSchema,
  invitationDetailsDtoSchema,
  refreshResponseSchema,
  revokeOthersResponseSchema,
  sessionListResponseSchema,
} from '@/modules/auth';
import { getEnvironment } from '@/packages/environment';
import { safeParseWithSchema } from '@/packages/schema';
import {
  MOCK_INVITATION,
  MOCK_RESET,
  MOCK_STRONG_PASSWORD,
  MOCK_TOKENS,
} from '@/tests/msw/mock-data.constants';

function apiUrl(path: string): string {
  return `${getEnvironment().apiBaseUrl}${path}`;
}

function postJson(path: string, body: unknown, bearer?: string): Promise<Response> {
  return fetch(apiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(bearer === undefined ? {} : { Authorization: `Bearer ${bearer}` }),
    },
    body: JSON.stringify(body),
  });
}

describe('auth recovery wire contract (mock mode = remote contract)', () => {
  it('POST /auth/forgot-password acknowledges', async () => {
    const response = await postJson('/auth/forgot-password', { email: 'user@example.com' });
    expect(response.status).toBe(200);
    expect(safeParseWithSchema(authAckSchema, await response.json()).success).toBe(true);
  });

  it('POST /auth/reset-password accepts a valid token and rejects a dead one', async () => {
    const ok = await postJson('/auth/reset-password', {
      token: MOCK_RESET.validToken,
      password: MOCK_STRONG_PASSWORD,
    });
    expect(ok.status).toBe(200);
    expect(safeParseWithSchema(authAckSchema, await ok.json()).success).toBe(true);

    const dead = await postJson('/auth/reset-password', {
      token: MOCK_RESET.expiredToken,
      password: MOCK_STRONG_PASSWORD,
    });
    expect(dead.status).toBe(400);
  });

  it('GET /auth/invitations/:token returns the invitation envelope', async () => {
    const response = await fetch(apiUrl(`/auth/invitations/${MOCK_INVITATION.validToken}`));
    expect(response.status).toBe(200);
    const parsed = safeParseWithSchema(invitationDetailsDtoSchema, await response.json());
    assert(parsed.success, 'the invitation body did not match the wire contract');
    expect(parsed.data.email).toBe(MOCK_INVITATION.email);
    expect(parsed.data.role).toBe(MOCK_INVITATION.role);
    expect(parsed.data.inviterName).toBeNull();
  });

  it('GET /auth/invitations/:token collapses invalid invitation states to validation errors', async () => {
    const expired = await fetch(apiUrl(`/auth/invitations/${MOCK_INVITATION.expiredToken}`));
    const used = await fetch(apiUrl(`/auth/invitations/${MOCK_INVITATION.usedToken}`));

    expect(expired.status).toBe(400);
    expect(used.status).toBe(400);
  });

  it('POST /invitations/accept returns a flat session then authenticates /auth/me', async () => {
    const response = await postJson('/invitations/accept', {
      token: MOCK_INVITATION.validToken,
      password: MOCK_STRONG_PASSWORD,
    });
    expect(response.status).toBe(201);
    const session = safeParseWithSchema(refreshResponseSchema, await response.json());
    assert(session.success, 'the accepted session did not match AuthSessionResponseDto');

    const currentUser = await fetch(apiUrl('/auth/me'), {
      headers: { Authorization: `Bearer ${session.data.accessToken}` },
    });
    expect(currentUser.status).toBe(200);
    expect(safeParseWithSchema(authUserDtoSchema, await currentUser.json()).success).toBe(true);
  });

  it('GET /auth/sessions honors the bearer token and rejects anonymous reads', async () => {
    const authed = await fetch(apiUrl('/auth/sessions'), {
      headers: { Authorization: `Bearer ${MOCK_TOKENS.access}` },
    });
    expect(authed.status).toBe(200);
    expect(safeParseWithSchema(sessionListResponseSchema, await authed.json()).success).toBe(true);

    const anonymous = await fetch(apiUrl('/auth/sessions'));
    expect(anonymous.status).toBe(401);
  });

  it('POST /auth/sessions/revoke-others returns the revoked count', async () => {
    const response = await postJson('/auth/sessions/revoke-others', {}, MOCK_TOKENS.access);
    expect(response.status).toBe(200);
    const parsed = safeParseWithSchema(revokeOthersResponseSchema, await response.json());
    assert(parsed.success, 'the revoke-others body did not match the wire contract');
    expect(parsed.data.revokedCount).toBeGreaterThanOrEqual(0);
  });
});
