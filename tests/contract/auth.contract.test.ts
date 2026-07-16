import { describe, expect, it } from 'vitest';

import {
  authUserDtoSchema,
  loginResponseSchema,
  logoutResponseSchema,
  refreshResponseSchema,
} from '@/modules/auth';
import { getEnvironment } from '@/packages/environment';
import { safeParseWithSchema, schemaBuilder } from '@/packages/schema';
import { MOCK_CREDENTIALS, MOCK_TOKENS } from '@/tests/msw/mock-data.constants';

const nestErrorContract = schemaBuilder.object({
  statusCode: schemaBuilder.number().int(),
  code: schemaBuilder.string(),
  message: schemaBuilder.string(),
  errors: schemaBuilder.array(schemaBuilder.unknown()),
  path: schemaBuilder.string(),
  timestamp: schemaBuilder.string(),
  requestId: schemaBuilder.string(),
});

function apiUrl(path: string): string {
  return `${getEnvironment().apiBaseUrl}${path}`;
}

async function postJson(path: string, body: unknown, accessToken?: string): Promise<Response> {
  return fetch(apiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken === undefined ? {} : { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(body),
  });
}

describe('auth wire contract (mock mode = remote contract)', () => {
  it('POST /auth/login returns the login envelope', async () => {
    const response = await postJson('/auth/login', MOCK_CREDENTIALS);
    expect(response.status).toBe(200);
    const parsed = safeParseWithSchema(loginResponseSchema, await response.json());
    expect(parsed.success).toBe(true);
  });

  it('POST /auth/login with bad credentials returns the NestJS error envelope', async () => {
    const response = await postJson('/auth/login', {
      email: MOCK_CREDENTIALS.email,
      password: 'wrong-password',
    });
    expect(response.status).toBe(401);
    const parsed = safeParseWithSchema(nestErrorContract, await response.json());
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.code).toBe('INVALID_CREDENTIALS');
    }
  });

  it('POST /auth/login without a body returns a validation envelope with field errors', async () => {
    const response = await postJson('/auth/login', {});
    expect(response.status).toBe(400);
    const body = (await response.json()) as { code: string; errors: unknown[] };
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.errors.length).toBeGreaterThan(0);
  });

  it('POST /auth/refresh rotates the pair', async () => {
    const response = await postJson('/auth/refresh', { refreshToken: MOCK_TOKENS.refresh });
    expect(response.status).toBe(200);
    const parsed = safeParseWithSchema(refreshResponseSchema, await response.json());
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.tokens.accessToken).toBe(MOCK_TOKENS.rotatedAccess);
    }
  });

  it('GET /auth/me honors issued bearer tokens', async () => {
    const login = await postJson('/auth/login', MOCK_CREDENTIALS);
    const loginBody = (await login.json()) as { tokens: { accessToken: string } };

    const me = await fetch(apiUrl('/auth/me'), {
      headers: { Authorization: `Bearer ${loginBody.tokens.accessToken}` },
    });
    expect(me.status).toBe(200);
    expect(safeParseWithSchema(authUserDtoSchema, await me.json()).success).toBe(true);

    const anonymous = await fetch(apiUrl('/auth/me'));
    expect(anonymous.status).toBe(401);
  });

  it('POST /auth/logout acknowledges', async () => {
    const response = await postJson('/auth/logout', {});
    expect(response.status).toBe(200);
    expect(safeParseWithSchema(logoutResponseSchema, await response.json()).success).toBe(true);
  });
});
