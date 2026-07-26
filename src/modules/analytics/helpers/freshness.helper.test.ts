import { describe, expect, it } from 'vitest';

import { buildFreshnessStatus, isProjectionStale } from './freshness.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

const NOW = Date.parse('2026-07-23T12:00:00.000Z');
const HOUR = 3_600_000;

describe('isProjectionStale', () => {
  it('treats a never-computed projection as stale', () => {
    expect(isProjectionStale(null, NOW)).toBe(true);
  });

  it('is fresh within the 24h policy window', () => {
    expect(isProjectionStale(new Date(NOW - 2 * HOUR).toISOString(), NOW)).toBe(false);
  });

  it('is stale past the policy window', () => {
    expect(isProjectionStale(new Date(NOW - 30 * HOUR).toISOString(), NOW)).toBe(true);
  });
});

describe('buildFreshnessStatus', () => {
  it('reports "never" for an uncomputed projection', () => {
    const status = buildFreshnessStatus(t, 'en', null, NOW);
    expect(status.isStale).toBe(true);
    expect(status.label).toBe('analytics.freshnessNever');
  });

  it('reports fresh within the window', () => {
    const status = buildFreshnessStatus(t, 'en', new Date(NOW - HOUR).toISOString(), NOW);
    expect(status.isStale).toBe(false);
    expect(status.label).toContain('analytics.freshnessFresh');
  });

  it('reports stale past the window', () => {
    const status = buildFreshnessStatus(t, 'en', new Date(NOW - 30 * HOUR).toISOString(), NOW);
    expect(status.isStale).toBe(true);
    expect(status.label).toContain('analytics.freshnessStale');
  });
});
