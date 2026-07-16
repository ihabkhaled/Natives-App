import { describe, expect, it } from 'vitest';

import { HEALTH_API_PATHS } from './health-api.constants';

describe('HEALTH_API_PATHS', () => {
  it('pins the health endpoint to its versioned-base-relative path', () => {
    expect(HEALTH_API_PATHS).toEqual({ health: '/health' });
  });

  it('keeps the path relative so the client base URL stays authoritative', () => {
    expect(HEALTH_API_PATHS.health.startsWith('/')).toBe(true);
    expect(HEALTH_API_PATHS.health).not.toContain('://');
  });
});
