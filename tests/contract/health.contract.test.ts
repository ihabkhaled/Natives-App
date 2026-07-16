import { describe, expect, it } from 'vitest';

import { healthResponseSchema } from '@/modules/health';
import { getEnvironment } from '@/packages/environment';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_HEALTH } from '@/tests/msw/mock-data.constants';

describe('health wire contract (mock mode = remote contract)', () => {
  it('GET /health matches the schema the app parses with', async () => {
    const response = await fetch(`${getEnvironment().apiBaseUrl}/health`);
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(healthResponseSchema, await response.json());
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toBe('ok');
      expect(parsed.data.version).toBe(MOCK_HEALTH.version);
      expect(Number.isNaN(Date.parse(parsed.data.timestamp))).toBe(false);
    }
  });

  it('rejects a payload that violates the contract', () => {
    const parsed = safeParseWithSchema(healthResponseSchema, {
      status: 'degraded',
      version: '',
      timestamp: 'not-a-date',
    });
    expect(parsed.success).toBe(false);
  });
});
