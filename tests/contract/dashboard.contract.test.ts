import { assert, describe, expect, it } from 'vitest';

import { dashboardSummaryResponseSchema } from '@/modules/dashboard';
import { getEnvironment } from '@/packages/environment';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_CREDENTIALS, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

function apiUrl(path: string): string {
  return `${getEnvironment().apiBaseUrl}${path}`;
}

async function loginAs(email: string): Promise<string> {
  const response = await fetch(apiUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: MOCK_CREDENTIALS.password }),
  });
  const body = (await response.json()) as { tokens: { accessToken: string } };
  return body.tokens.accessToken;
}

describe('dashboard summary wire contract (mock mode = remote contract)', () => {
  it.each([
    { email: MOCK_PERSONA_EMAILS.member, persona: 'member', prefix: 'member-' },
    { email: MOCK_PERSONA_EMAILS.coach, persona: 'coach', prefix: 'coach-' },
    { email: MOCK_PERSONA_EMAILS.admin, persona: 'administrator', prefix: 'admin-' },
  ])(
    'serves a $persona-shaped projection matching the schema',
    async ({ email, persona, prefix }) => {
      const token = await loginAs(email);
      const response = await fetch(apiUrl('/dashboard/summary'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.status).toBe(200);

      const parsed = safeParseWithSchema(dashboardSummaryResponseSchema, await response.json());
      assert(parsed.success, `mock ${persona} summary violated the schema the app parses with`);
      expect(parsed.data.persona).toBe(persona);
      expect(parsed.data.widgets.length).toBeGreaterThan(0);
      expect(parsed.data.widgets.every((widget) => widget.kind.startsWith(prefix))).toBe(true);
    },
  );

  it('rejects an anonymous request with the NestJS error envelope', async () => {
    const response = await fetch(apiUrl('/dashboard/summary'));

    expect(response.status).toBe(401);
    const body = (await response.json()) as { code: string };
    expect(body.code).toBe('UNAUTHORIZED');
  });
});
