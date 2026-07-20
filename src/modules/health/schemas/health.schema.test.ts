import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';

import { healthResponseSchema } from './health.schema';

const validPayload = { status: 'ok', version: '1.4.2', timestamp: '2026-07-16T10:15:00.000Z' };

describe('healthResponseSchema', () => {
  it('accepts a healthy payload', () => {
    expect(safeParseWithSchema(healthResponseSchema, validPayload)).toEqual({
      success: true,
      data: validPayload,
    });
  });

  it('accepts an error payload', () => {
    const payload = { ...validPayload, status: 'error' };

    expect(safeParseWithSchema(healthResponseSchema, payload)).toEqual({
      success: true,
      data: payload,
    });
  });

  it('accepts a timestamp carrying a non-UTC offset', () => {
    const payload = { ...validPayload, timestamp: '2026-07-16T10:15:00+02:00' };

    expect(safeParseWithSchema(healthResponseSchema, payload).success).toBe(true);
  });

  it('rejects a status outside the contract union', () => {
    expect(
      safeParseWithSchema(healthResponseSchema, { ...validPayload, status: 'degraded' }).success,
    ).toBe(false);
  });

  it('accepts the deployed probe payload, which carries uptime instead of a version', () => {
    const payload = { status: 'ok', uptimeSeconds: 413, timestamp: validPayload.timestamp };

    expect(safeParseWithSchema(healthResponseSchema, payload)).toEqual({
      success: true,
      data: payload,
    });
  });

  it('rejects a negative uptime', () => {
    expect(
      safeParseWithSchema(healthResponseSchema, { ...validPayload, uptimeSeconds: -1 }).success,
    ).toBe(false);
  });

  it('rejects an empty version', () => {
    expect(
      safeParseWithSchema(healthResponseSchema, { ...validPayload, version: '' }).success,
    ).toBe(false);
  });

  it('rejects a timestamp that is not an ISO datetime', () => {
    expect(
      safeParseWithSchema(healthResponseSchema, { ...validPayload, timestamp: 'not-a-date' })
        .success,
    ).toBe(false);
  });
});
