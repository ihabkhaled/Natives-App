import { describe, expect, it } from 'vitest';

import { DASHBOARD_API_PATHS } from './dashboard-api.constants';

describe('DASHBOARD_API_PATHS', () => {
  it('pins the summary endpoint to its versioned-base-relative path', () => {
    expect(DASHBOARD_API_PATHS).toEqual({ summary: '/dashboard/summary' });
  });

  it('keeps the path relative so the client base URL stays authoritative', () => {
    expect(DASHBOARD_API_PATHS.summary.startsWith('/')).toBe(true);
    expect(DASHBOARD_API_PATHS.summary).not.toContain('://');
  });
});
