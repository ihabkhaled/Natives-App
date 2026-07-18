import { assert, describe, expect, it } from 'vitest';

import {
  authAckSchema,
  invitationDetailsDtoSchema,
  loginResponseSchema,
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
  it('POST /auth/password/forgot acknowledges', async () => {
    const response = await postJson('/auth/password/forgot', { email: 'user@example.com' });
    expect(response.status).toBe(200);
    expect(safeParseWithSchema(authAckSchema, await response.json()).success).toBe(true);
  });

  it('POST /auth/password/reset accepts a valid token and rejects a dead one', async () => {
    const ok = await postJson('/auth/password/reset', {
      token: MOCK_RESET.validToken,
      password: MOCK_STRONG_PASSWORD,
    });
    expect(ok.status).toBe(200);
    expect(safeParseWithSchema(authAckSchema, await ok.json()).success).toBe(true);

    const dead = await postJson('/auth/password/reset', {
      token: MOCK_RESET.expiredToken,
      password: MOCK_STRONG_PASSWORD,
    });
    expect(dead.status).toBe(410);
  });

  it('GET /auth/invitations/:token returns the invitation envelope', async () => {
    const response = await fetch(apiUrl(`/auth/invitations/${MOCK_INVITATION.validToken}`));
    expect(response.status).toBe(200);
    const parsed = safeParseWithSchema(invitationDetailsDtoSchema, await response.json());
    assert(parsed.success, 'the invitation body did not match the wire contract');
    expect(parsed.data.email).toBe(MOCK_INVITATION.email);
  });

  it('POST /auth/invitations/:token/accept returns a login envelope', async () => {
    const response = await postJson(`/auth/invitations/${MOCK_INVITATION.validToken}/accept`, {
      password: MOCK_STRONG_PASSWORD,
    });
    expect(response.status).toBe(200);
    expect(safeParseWithSchema(loginResponseSchema, await response.json()).success).toBe(true);
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
